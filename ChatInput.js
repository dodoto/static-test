import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, TextInput, Text, View, Keyboard, StyleSheet, Animated, Easing } from 'react-native';
// import Animated, { Easing, useValue } from 'react-native-reanimated';

export default function ChatInput() {
  const msgs = new Array(50).fill('我是聊天信息')
  
  // useEffect(()=>{
  //   let test = Keyboard.addListener('keyboardDidHide',showBt)
  //   return () => test.remove()
  // },[])

  return (
    <>
      <Text style={styles.head}>我是聊天窗口头部</Text>

      <View style={styles.box}>

        <View style={styles.chatwindow}>
          <ScrollView>
            {
              msgs.map((item,index) => (
                <Text style={{marginHorizontal:20,marginTop:10,backgroundColor:'skyblue'}} key={index}>{item+index}</Text>
              ))
            }
          </ScrollView>
        </View>
        <Input />
      </View>

    </>
  );
}

//Dimenssion    style and useInsets 
//屏幕高度 598 - head 高度 80 - input 高度 40 = 478
function Input() {

  const [type,setType] = useState('')

  const translateY = useRef(new Animated.Value(478)).current;

  const btAnime = (dest) => {
    Animated.timing(
      translateY,
      {
        toValue: dest,
        duration: 10,
        easing: Easing.ease,
        useNativeDriver: true
      }
    ).start()
  }

  const pressEmoji = () => {
    if(type === 'emoji') {
      setType('')
      btAnime(478)
    }else{
      if(type === 'keyboard') Keyboard.dismiss();
      setType('emoji')
      let dest = 478 - 220
      btAnime(dest)
    }
  }

  const pressUtil = () => {
    if(type === 'util') {
      setType('')
      btAnime(478)
    }else{
      if(type === 'keyboard') Keyboard.dismiss();
      setType('util')
      let dest = 478 - 220
      btAnime(dest)
    }
  }

  useEffect(()=>{
    let test1 = Keyboard.addListener('keyboardDidShow',(e)=>{
      let dest = 478 - Math.ceil(e.endCoordinates.height)
      setType('keyboard');
      // btAnime(dest)
      translateY.setValue(dest)
    })
    let test2 = Keyboard.addListener('keyboardDidHide',(e)=>{
      if(!type || type === 'keyboard') translateY.setValue(478)
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
      <View style={styles.horizonal}>
        <TextInput style={styles.input}/>
        <Text style={styles.btn} onPress={pressEmoji}>表情</Text>
        <Text style={styles.btn} onPress={pressUtil}>工具</Text>
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
  chatwindow: {
    flex:1,
    paddingBottom:40    //textinput的高度
  },
  inputbox: {
    position:'absolute',
    left: 0, 
    right: 0, 
    top: 0, 
    bottom:0,
    backgroundColor:'#fff'
  },
  horizonal: {
    flexDirection: 'row'
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: 'yellow'
  },
  btn: {
    width: 40,
    height: 40,
    textAlign: 'center',
    lineHeight: 40,
    backgroundColor:'#666',
    color: '#fff'
  }
});