import React from 'react'
import { 
  View, 
  Text, 
  Animated, 
  Easing, 
  PanResponder, 
  StyleSheet, 
  DeviceEventEmitter,
  Dimensions 
} from 'react-native'

const height = Dimensions.get('window').height
export default class VerticalSliderMenu extends React.Component {

  state = {
    component: null,
    height: 20  //controlbar height
  }

  translateY = new Animated.Value(height)

  componentTranslateY = new Animated.Value(0)

  panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event(
        [
            null,
            {
                dy: this.componentTranslateY
            },
        ],
        { useNativeDriver: false }
    ),
    onPanResponderRelease: () => {
        if(this.componentTranslateY._value > this.state.height/2) {
            //消失
            this.hidde()
        }else{
            //复原
            this.back()
        }
        console.log('relese')
    }
  })

  animate(value,dest,callback = () => {}) {
    Animated.timing(
      value,
      {
        toValue: dest,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: true
      }
    ).start(callback)
  }

  //组件的出现
  open() {
    this.animate(this.translateY,0)
  }
  //组件的关闭
  close() {
    this.animate(this.translateY,height)
  }
  // 菜单的消失
  hidde() {
    this.animate(this.componentTranslateY,this.state.height,this.close)
  }
  // 菜单的复原
  back() {
    this.animate(this.componentTranslateY,0)
  }

  close = this.close.bind(this)

  componentDidMount() {
    this.handler = DeviceEventEmitter.addListener('callSliderMenu',({show,component,height})=>{
      if(show) {
        this.componentTranslateY.setValue(0)
        this.open()
        this.setState({ component, height: height + 20 })
      }else{
        this.close()
        this.setState({ component: null, height: 0 })
      }
    })
  }

  componentWillUnmount() {
    this.handler.remove()
  }

  render() {
    const { translateY, state, componentTranslateY } = this
    const opacity = translateY.interpolate({
      inputRange: [0,200],
      outputRange: [1,0],
      extrapolate: 'clamp'
    })
    const _translateY = componentTranslateY.interpolate({
      inputRange: [0,state.height],
      outputRange: [0,state.height],
      extrapolate: 'clamp'
    })
    return (
      <Animated.View style={[styles.container,{opacity}]} pointerEvents="box-none">
        <Animated.View 
          style={[styles.full,{transform:[{translateY}]}]}
        >
          <Text style={styles.full} onPress={this.close}></Text>
          <Animated.View 
            {...this.panResponder.panHandlers}
            style={[{height:state.height},{transform:[{translateY:_translateY}]}]}
          >
            <View style={styles.controlBar}>
              <Text style={styles.block}></Text>
            </View>
            {state.component && state.component()}
          </Animated.View>
        </Animated.View>
      </Animated.View>
    )
  }

}

const styles = StyleSheet.create({
  container:{
    position:'absolute',
    backgroundColor:'rgba(0,0,0,0.6)',
    top: 0, left: 0, right: 0, bottom: 0
  },
  full: {
    flex:1
  },
  controlBar: {
    height:20,
    backgroundColor:'#fff',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10
  },
  block: {
    width: 30,
    height: 6,
    backgroundColor: '#EBEEF5',
    borderRadius: 50,
    alignSelf: 'center',
    marginTop: 7
  }
})