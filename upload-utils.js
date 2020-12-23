
export function getReadFunc() {
  let timer = null;
  let files = [];
  let folders = [];
  return function (items,callback,createFolder,upload) {
    if(!callback) {
      console.log('callback is required');
      return
    };
    if(typeof callback !== 'function') {
      console.log('callback is not a functioin');
      return
    };
    if(timer) clearTimeout(timer);
    timer = setTimeout(()=>{
      console.log('timer',timer);
      console.log('build',folders.length);
      // createFolder()
      console.log('upload',files);
      // upload()
      callback = null;
    },500);
    items.forEach(item => {
      let target;
      if(item.webkitGetAsEntry) {
        target = item.webkitGetAsEntry();
      }else{
        target = item;
      }
      if(target.isFile) {
        console.log('is file');
        target.file(file=> files.push({file,path:target.fullPath}));
      }else{
        console.log('is folder');
        folders.push(target.fullPath);
        let reader = target.createReader();
        reader.readEntries(entries => callback(entries,callback));
      };
    });
  }
}


export function read(target) {
  return new Promise((resolve,reject) => {
    let index = 0;               //当前读取的目录下标
    let qeue = [];               //目录数组
    let uploadList = [];         //上传的文件  
    let folders = [];            //创建的文件夹路径
  
    //归类
    let sortOut = function(target) {
      if(target.isFile) {
        target.file(file=>{
          uploadList.push({file,parentPath:target.fullPath});
        });
      }else{
        folders.push(target.fullPath);
        qeue.push(target);
      };
    }
    
    //读取目录
    let readFolder = function(target) {
      return new Promise((resolve,reject) => {
        if(!target) {
          reject('over')
        }else{
          let reader = target.createReader();
          reader.readEntries(
            entries => resolve(next(entries)),
            error => reject(error)
          );
        };
      });
    }
    
    let next = function(entries) {
      entries.forEach(entry => sortOut(entry));
      index++;
      let target = qeue[index];
      return readFolder(target)
    }
  
    sortOut(target);
  
    readFolder(qeue[index])
    .then(res => next(res))
    .catch(err => {
      if(err === 'over') {
        resolve({uploadList,folders});
      }else{
        reject('read failed');
      }
    })
  })
}



