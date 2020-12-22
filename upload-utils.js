// import SparkMD5 from "spark-md5";
// import aixos from 'axios';

function computedMD5(file) {
  // let time = new Date().getTime();
  let md5 = "";
  fileReader.readAsArrayBuffer(file);
  fileReader.onload = e => {
    if (file.size != e.target.result.byteLength) {
      console.log("浏览器报成功但是一直不能读取文件信息");
      return;
    }
    md5 = SparkMD5.ArrayBuffer.hash(e.target.result);
    file.uniqueIdentifier = md5;
  };
}

function isBigFile(file) {
  // 2MB = 2 * 1024 * 1024
  return file.size >= 2 * 1024 * 1024;
}

export function getReadFunc() {
  let timer = null;
  let files = [];
  let folders = [];
  return function (items,callback) {
    if(timer) clearTimeout(timer);
    timer = setTimeout(()=>{
      console.log('timer',timer);
      console.log('build',folders.length);
      console.log('upload',files);
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

// function post() {
//   return new Promise((resolve,reject) => {
//     aixos.post(url,data)
//     .then(res => {
//       resolve(res.data);
//     })
//     .catch(err => {
//       reject(err);
//     })
//   })
// }

// function get() {
//   return new Promise((resolve, reject) => {
//     axios.get(url, {
//       params: params
//     }).then(res => {
//       resolve(res.data);
//     }).catch(err => {
//       reject(err);
//     })
//   })
// }


