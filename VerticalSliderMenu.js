import React from 'react'
import { 
  View, 
  Text, 
  Animated, 
  Easing, 
  PanResponder, 
  StyleSheet, 
  DeviceEventEmitter,
  InteractionManager
} from 'react-native'

export default class VerticalSliderMenu extends React.Component {

  state = {
    component: null,
    height: 0
  }

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
        if(this.componentTranslateY._value > (this.state.height+35)/2) {
            //消失
            this.close()
        }else{
            //复原
            this.back()
        }
    }
  })

  animate(value,dest,callback = () => {}) {
    Animated.timing(
      value,
      {
        toValue: dest,
        duration: 250,
        easing: Easing.linear,
        useNativeDriver: true
      }
    ).start(callback)
  }

  //组件的出现
  open(component,height) {
    this.componentTranslateY.setValue(height)
    this.setState({ component, height},() => {
      this.animate(this.componentTranslateY,0)
    })
  }
  //组件的关闭
  close() {
    const { componentTranslateY, state } = this
    let callback = () => this.setState({ component: null, height: 0 })
    this.animate(componentTranslateY,state.height,callback)
  }

  close = this.close.bind(this)

  back() {
    this.animate(this.componentTranslateY,0)
  }

  componentDidMount() {
    this.handler = DeviceEventEmitter.addListener('callSliderMenu',({show,component,height})=>{
      // height += 50
      if(show) {
        this.open(component,height)
      }else{
        this.close()
      }
    })
  }

  componentWillUnmount() {
    this.handler.remove()
  }

  render() {
    const { state, componentTranslateY } = this
    const opacity = componentTranslateY.interpolate({
      inputRange: [0,state.height],
      outputRange: [1,0],
      extrapolate: 'clamp'
    })
    const translateY = componentTranslateY.interpolate({
      inputRange: [0,state.height],
      outputRange: [0,state.height],
      extrapolate: 'clamp'
    })
    if(state.component) {
      return (
        <View style={styles.container}>
          <Animated.Text style={[styles.full,{opacity}]} onPress={this.close}></Animated.Text>
          <Animated.View 
            {...this.panResponder.panHandlers}
            style={[{transform:[{translateY}]}]}
          >
            <View style={styles.controlBar}>
              <Text style={styles.block}></Text>
            </View>
            <View style={{height:state.height,backgroundColor:'#fff'}}>
              {state.component}
            </View>
          </Animated.View>
        </View>
      )
    }else{
      return null
    }
  }

}

const styles = StyleSheet.create({
  container:{
    position:'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'flex-end'
  },
  full: {
    position: 'absolute',
    width: '100%', height: '100%',
    backgroundColor:'rgba(0,0,0,0.6)',
    zIndex: -1
  },
  controlBar: {
    height:35,
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