import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

import SimpleBus from './live/simple-bus/simpleBus';

// import Chip from '@material-ui/core/Chip';

//调度中心
/***
 * 轨道的数据记录
 * 
 * 数据缓冲区,每次最大渲染数 tracks.length * 过渡时间
 * 
 * 轨道暂定都是10条
 * 
 */
class Controller {
  constructor() {
    this.releaseHandler = [];          //自定义释放轨道事件回调列表
    this.tracks = null;                //轨道集合
    this.trackHeight = 50;             //轨道高度
    this.buffer = [{txt:'缓存区测试',key:'buffer'}];                  //缓冲区
    this.maxRender = 0;                //最大渲染数
  }; 

  //获得数据过多存入缓冲区
  setBuffer(data) {
    this.buffer.push(data); //for test
    // this.buffer = this.buffer.concat(data);
  };

  //读取缓冲区
  readBuffer() {
    let data = this.buffer.splice(0,1);
    // this.readCount++;
    return data[0];
  };

  //监听轨道释放
  addReleaseListner(fun) {
    this.releaseHandler.push(fun);
  };

  //移除监听
  removeReleaseListner(fun) {
    this.releaseHandler = this.releaseHandler.filter(item => item !== fun);
  };

  //初始化轨道
  initTrack(containerHeight) {
    this.trackHeight = Math.floor(containerHeight * 0.1);
    // let length = Math.floor(containerHeight / this.trackHeight);
    this.maxRender = 10 * 8;
    let tracks = {};
    for(let i=0;i<10;i++) {
      tracks[i] = [];
    };
    this.tracks = tracks; 
  };

  //请求轨道
  requestTrack(el,box) {
    let trackKey = -1;
    for(let key in this.tracks) {
      //查找空的轨道
      let track = this.tracks[key];
      let length = track.length;
      let preEl = track[length-1];
      if(!preEl) {
        trackKey = key;
        break;
      }else{
        //没有找到空的轨道，询问是否可以跟入
        let checkResult = this.checkTrack(preEl,el,box);
        //可以跟入
        if(checkResult) {
          trackKey = key;
          break;
        }
      } 
    }
    return trackKey;
  };

  //进入轨道
  enterTrack(el,trackKey) {
    this.tracks[trackKey].push(el);
  };

  //检测轨道能否跟进
  checkTrack(preEl,el,container) {
    // container: 表示容器相关属性
    // preEl：表示候选弹幕元素对象
    // if (preEl) {
      const preElProps = preEl.getBoundingClientRect();
      const containerProps = container.getBoundingClientRect();
      const elProps = el.getBoundingClientRect();

      // 轨道中最后一个元素要求已经全部进入展示区域
      if (preElProps.right > containerProps.right) {
          return false;
      }

      // 基本公式：s = v * t
      const lastS = preElProps.left - containerProps.left + preElProps.width;
      const lastV = (containerProps.width + preElProps.width) / 8;
      const lastT = lastS / lastV;
      const newS = containerProps.width;
      const newV = (containerProps.width + elProps.width) / 8;
      const newT = newS / newV;
      // 追及问题
      if (lastV < newV && lastT > newT) {
          return false;
      };
    
    return true; 
  };

  //释放轨道
  releaseTrack(el,trackKey) {
    if(trackKey === Infinity) return //当实例被移除则无法计算到对应的key
    //不传入弹幕dom实例和所在轨道则释放所有轨道
    if(!el && !trackKey) {
      for(let key in this.tracks) {
        let length = this.tracks[key].length;
        if(length) {
          this.tracks[key].splice(0,length);
        };
      };
    }else{
      let i = this.tracks[trackKey].findIndex(item => item === el);
      this.tracks[trackKey].splice(i,1);
      //之前订阅的进行轨道查询,如果轨道被成功占用则跳过后续的执行
      for(let idx=0;idx<this.releaseHandler.length;idx++){
        let a = this.releaseHandler[idx]();
        if(a >= 0) break;
      };
      // this.releaseHandler.forEach(cb => cb());
    };
  }; 
}

//收到数据
//数据过多 截取 track * 8 渲染, 剩余进入缓冲区
//每次轨道释放 读取缓冲区
//中间 新数据进来 查看渲染数量 看截取数量, 剩余进入缓冲区

function Item(props) {
  let dom = useRef(null);

  const {txt,box,remove,index,controller} = props;

  const transitionEnd = () => {
    // console.log(`${index} transition over and will remove`);
    remove(index);
  };

  useEffect(()=>{
    //如果页面不可见,则不生成弹幕
    if(document.visibilityState === 'hidden') {
      remove(index);
      return
    };
    let el = dom.current;
    let s = el.clientWidth + box.clientWidth;
    let key = controller.requestTrack(el,box);
    //如果有key的执行函数
    const hasKeyHandler = (el,key) => {
      el.trackKey = key;
      el.style.color = `#${Math.floor(Math.random()*16777215).toString(16)}`; 
      el.style.opcity = .5;
      el.style.top = `${key * controller.trackHeight}px`;
      el.style.transition = `transform 8s linear `;
      el.style.transform = `translate3d(${-s}px,0,0)`;
      el.style.willChange = 'transform';
      el.s = s;
      controller.enterTrack(el,key);
    }

    const releaseHandler = () => {
      //查询轨道
      let key = controller.requestTrack(el,box);
      if(key >= 0) {
        // console.log(index,'重新获取到轨道:',key);
        hasKeyHandler(el,key);
        controller.removeReleaseListner(releaseHandler);
      };
      return key;
    };

    //查询轨道
    if(key >= 0) {
      hasKeyHandler(el,key);
    }else{
      //如果没有轨道
      console.log('没有轨道,监听轨道释放');
      controller.addReleaseListner(releaseHandler);
      // console.log('没有轨道进入等待队列');
      // controller.enterQueue(el);
    };
    return () => {
      // console.log(`${index} removed and trackKey:${key}`);
      // console.log('el',el);
      if(!el.isRelease) {
        controller.releaseTrack(el,el.trackKey);
      };
    };
  },[box,controller,index,remove]);

  const enterHandler = () => {
    let el = dom.current;
    let { right: containerRight } = box.getBoundingClientRect();
    let { right: selfRight, width } = el.getBoundingClientRect();
    let s = containerRight + width - selfRight;
    el.style.transition = `transform 0s linear `;
    el.style.transform = `translate3d(${-s}px,0,0)`;
    el.style.color = '#fff';
    el.resumeT = 8 * ( 1 - s / el.s);
    // //释放轨道
    if(!el.isRelease) {
      el.isRelease = true;
      controller.releaseTrack(el,el.trackKey);
    };
  };

  const leaveHandler = () => {
    let el = dom.current;
    el.style.transition = `transform ${el.resumeT}s linear `;
    el.style.transform = `translate3d(${-el.s}px,0,0)`;
    // remove(index);
  };

  return (
    <React.Fragment>
      <p
        ref={dom}
        className={'danmaku'}
        style={{
          position: 'absolute',
          left: '100%',
          display: 'inline-block',
          whiteSpace: 'nowrap',
          fontSize: '1em',
          padding: '.4em',
          fontWeight: 'bold',
          cursor: 'default',
        }}    
        onMouseEnter={enterHandler}
        onMouseLeave={leaveHandler}
        onTransitionEnd={transitionEnd}
      >
        {/* <Chip label={txt} /> */}
        {txt}
      </p>
    </React.Fragment>
  )
}

// function useRefCallback(fn, dependencies) {
//   // console.log(dependencies);
//   const ref = useRef(fn);

//   useEffect(() => {
//     ref.current = fn;
//   }, [fn, ...dependencies]);

//   return useCallback((index) => {
//     const fn = ref.current;
//     return fn(index);
//   }, [ref]);
// }

const Danmu = memo((props)=> <Item {...props}/>)
function Home() {
  //同步渲染数据
  const saveData = useRef([]);
  //弹幕容器
  const dom = useRef(null);
  //渲染数据
  const [data,setData] = useState([]);
  //调度中心
  const trackCenter = useRef(null);

  //初始化调度中心
  useEffect(()=>{
    console.log(dom)
    let controller = new Controller();
    // // console.log(`容器大小:高-${dom.current.clientHeight},宽-${dom.current.clientWidth}`);
    controller.initTrack(dom.current.clientHeight);
    // settrackCenter.current(controller);
    trackCenter.current = controller;

    const send = (txt) => {
      saveData.current.push({txt,key:Math.random()*1000});
      setData([...saveData.current]);
    };
    SimpleBus.subscribe('send',send);
    return () => {
      trackCenter.current = null;
      saveData.current = [];
      SimpleBus.unsubscribe('send',send)
    };
  },[]);
  
  //resize visibilitychange 事件
  useEffect(()=>{
    const handler = () => {
      // trackCenter.current.initTrack(dom.current.clientHeight); //重置轨道高度
      trackCenter.current.trackHeight = Math.floor(dom.current.clientHeight * 0.1);
      //清除已经渲染 
      saveData.current = [];                                   
      setData([...saveData.current]);
    };
    const visibleHandler = () => {
      //如果页面不可见,清除所有弹幕释放轨道
      if(document.visibilityState === 'hidden') handler();
    };
    window.addEventListener('visibilitychange',visibleHandler,false);
    window.addEventListener('resize',handler,false);
    return () => {
      window.removeEventListener('visibilitychange',visibleHandler,false);
      window.removeEventListener('resize',handler,false);
    };
  },[trackCenter,saveData]);
  //模拟读取数据
  useEffect(()=>{
    let timer = setInterval(()=>{
      //如果 buffer有数据先读取buffer的数据
      if(trackCenter.current.buffer.length && saveData.current.length < trackCenter.current.maxRender) {
        console.log(`缓冲区有${trackCenter.current.buffer.length}条数据且可以被渲染`);
        let peice = trackCenter.current.readBuffer();
        saveData.current.push(peice);
        setData([...saveData.current])
      }else{
      //没有则读取外面的数据  
        let key = new Date().getTime();
        if(saveData.current.length < trackCenter.current.maxRender) {
          saveData.current.push({txt:`test:${key}`,key:key});
          setData([...saveData.current]);
        }else{
          //如果外面数据过多
          trackCenter.current.setBuffer({txt:`test:${key}`,key:key});
        };
      }
    },250);
    return () => {clearInterval(timer)}
  },[trackCenter,saveData]);

  //每次生成数据都是新的data
  //移除数据没有添加依赖导致data 一直都是旧的
  //所以第二次点击生成数据,移除数据里拿到的还是第一次生成的data,但是第一次生成的data已经为[]

  //移除数据
  const remove = useCallback((index) => {
    // let i = saveData.current.findIndex(item => item.key === index);
    // saveData.current.splice(i,1);
    saveData.current = saveData.current.filter(item => item.key !== index);
    setData([...saveData.current]);
  },[saveData]);

  // 嵌套过深数据不准确
  // const remove = useRefCallback((index) => {
  //   let i = data.findIndex(item => item.key === index);
  //   console.log(data);
  //   data.splice(i,1);
  //   // let arr = data.filter(item => item.key !== index);
  //   setData([...data]);
  // },[data]);

  return (
    <div style={{position:'absolute',zIndex:10,width:'100%',height:'100%'}} >
      <div 
        ref={dom}
        style={{
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
          fontSize: '1vw',
          backgroundColor: 'rgba(0,0,0,.5)'
        }}
      >
        {
          data.map((item) => (
            <Danmu 
              {...item}
              index={item.key}
              remove={remove}
              box={dom.current}
              controller={trackCenter.current}
            />
          ))
        }
      </div>
    </div>
  );
}

export default Home;

//持续读取数据,最大渲染量等于轨道数量*过渡时间6s

//如果数据过多,则进入缓冲区


