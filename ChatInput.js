import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, TextInput, Text, View, Keyboard, StyleSheet,Dimensions } from 'react-native';

import Animated, { Easing, useValue } from 'react-native-reanimated';

const height = Dimensions.get("window").height - 80 - 56;

export default function ChatInput() {
  const msgs = new Array(50).fill('我是聊天信息')

  const msgList = useRef();

  const scrollHeight = useValue(height);

  const handler = (y) => {
   Animated.timing(
      scrollHeight,
      {
        toValue: y,
        duration: 10,
        easing: Easing.linear
      }
    ).start(()=>{
      msgList.current.scrollToEnd({animated:true});
    })
  }

  useEffect(()=>{
    msgList.current.scrollToEnd({animated:false});
  },[])

  return (
    <>
      <Text style={styles.head}>我是聊天窗口头部</Text>

      <View style={styles.box}>
        <Animated.View style={[{height:scrollHeight}]}>
          <ScrollView ref={msgList}>
            {
              msgs.map((item,index) => (
                <Text style={{margin:10,backgroundColor:'skyblue'}} key={index}>{item+index}</Text>
              ))
            }
          </ScrollView>
        </Animated.View>
        <Input 
          onToolChange={handler}
        />
      </View>

    </>
  );
}

//Dimenssion    style and useInsets 
//屏幕高度 598 - head 高度 80 - input 高度 56 = 478

function Input({onToolChange}) {

  const [type,setType] = useState('');

  const translateY = useValue(height);

  const initLayoutHeight = useRef(0);    //一行的高度

  const offset = useRef(0);              //换行后高度差 

  const keybaordHeight = useRef(0);      //键盘高度

  const btAnime = (dest) => {
    Animated.timing(
      translateY,
      {
        toValue: dest,
        duration: 100,
        easing: Easing.ease
      }
    ).start()
  }

  const pressEmoji = () => {
    let bottom = 0;
    if(type === 'emoji') {
      setType('')
      btAnime(height)
      bottom = height;
    }else{
      if(type === 'keyboard') Keyboard.dismiss();
      setType('emoji')
      let dest = height - 220
      btAnime(dest)
      bottom = dest
    }
    onToolChange(bottom+offset.current);
  }

  const pressUtil = () => {
    let bottom = 0;
    if(type === 'util') {
      setType('')
      btAnime(height)
      bottom = height;
    }else{
      if(type === 'keyboard') Keyboard.dismiss();
      setType('util')
      let dest = height - 220
      btAnime(dest)
      bottom = dest;
    }
    onToolChange(bottom+offset.current)
  }

  const layout = ({nativeEvent:{layout:{height:inputHeight}}}) => {
    if(initLayoutHeight.current === 0) {
      //获取初始高度
      initLayoutHeight.current = inputHeight;
    }else{
      offset.current = initLayoutHeight.current - inputHeight;
      //换行 只有键盘出现
      let dest = height - keybaordHeight.current + offset.current;
      onToolChange(dest);
    }
  }


  //监听键盘
  useEffect(()=>{
    let test1 = Keyboard.addListener('keyboardDidShow',(e)=>{
      keybaordHeight.current = e.endCoordinates.height;
      let dest = height - keybaordHeight.current;
      setType('keyboard');
      // btAnime(dest)
      translateY.setValue(dest);
      // 
      onToolChange(dest+offset.current);
    })
    let test2 = Keyboard.addListener('keyboardDidHide',(e)=>{
      if(!type || type === 'keyboard') {
        translateY.setValue(height)
        onToolChange(height+offset.current);
      }
    })
    return () => {
      test1.remove();
      test2.remove();
    }
  },[type])

  return (
    <Animated.View 
      style={[styles.inputbox,{transform:[{translateY}]}]}
    >
      <View style={{position:'relative',height:56}}>
        <View style={styles.horizonal} onLayout={layout}>
          <TextInput 
            style={styles.input} 
            multiline={true}
            blurOnSubmit={false}
            placeholder={'输入聊天信息'}
          />
          <Text style={styles.btn} onPress={pressEmoji}>表情</Text>
          <Text style={styles.btn} onPress={pressUtil}>工具</Text>
        </View>
      </View>

      <View style={{height:220,backgroundColor:'#fff'}}>
        {/* <Text>我是工具栏</Text> */}
        { type === 'emoji' && <Text>我是表情</Text> }
        { type === 'util' && <Text>我是功能栏</Text> }
      </View>
    </Animated.View> 
  );
}

const styles = StyleSheet.create({
  head: {
    height:80,
    lineHeight:80,
    textAlign:'center',
    backgroundColor:'gray'
  },
  box: {
    position:'relative',
    flex:1
  },
  inputbox: {
    position:'absolute',
    left: 0, 
    right: 0, 
    top: 0, 
    bottom:0,
    backgroundColor:'#fff',
  },
  horizonal: {
    flexDirection: 'row',
    position: 'absolute',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    bottom: 0,
    maxHeight: 150,
    padding: 8,
    zIndex: 1,
  },
  input: {
    flex:1,
    paddingVertical: 6,        //控制 TextInput 初始大小
    backgroundColor: '#F2F6FC',
    borderRadius: 5,
    borderWidth: 0.33,
    borderColor: '#DCDFE6'
  },
  btn: {
    width: 40,
    height: 40,
    textAlign: 'center',
    lineHeight: 40,
    borderRadius: 5,
    marginLeft: 8,
    backgroundColor:'#C0C4CC',
    color: '#fff'
  }
});

//如果使用paddingBottom或者marginBottom会导致键盘和表情工具切换时,键盘先消失,padding或margin才归0,有一瞬间的白色闪烁

//信息列表高度 和 chatInput 的偏移 使用的动画值是想等的, 但是在多行后, 信息列表高度需要调整而偏移量不需要调整所以要有两个动画实例

//高度可以被提前计算 屏幕高度 - 头部高度(样式里写好+刘海屏判断添加) - input容器父元素高度56(input默认40.666+16padding)
