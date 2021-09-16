/**
* This is the category component used in the home page
**/

// React native and others libraries imports
import React, { Component } from 'react';
import { Dimensions, TouchableOpacity } from 'react-native';
import { Card, View, Text, Content  } from 'native-base';
import FastImage from 'react-native-fast-image'
// Our custom files and classes import

export default class CategoryBlock extends Component {
   constructor(props){
    super(props)
    this.state = {
     
    }
  }
  render(){
    return(
      <View  style={{justifyContent: "center", alignContent: "center", paddingHorizontal: 10}}>
      <Card transparent>
      <TouchableOpacity style={{ borderRadius: 10, borderWidth: 1,}}  onPress={() => this.props.navigation.navigate("Stores", {'store': this.props.title, "navigation" :this.props.navigation})}>
      <View>
      {console.log('this.props.image: ', this.props.image)}
             <FastImage
                style={styles.image}
                source={{
                                uri: this.props.image,

                    headers: { Authorization: 'someAuthToken' },
                    priority: FastImage.priority.high,
                }}
                resizeMode={FastImage.resizeMode.cover}
            />
            <View style={styles.text}>
              <Text style={styles.title}>{this.props.title}</Text>
              <Text style={styles.subtitle}>SECTION</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Card>
      </View>
    );
  }
}



const styles = {
  text: {
    width: Dimensions.get('window').width - 25,
    height: 150,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',

    
  },
  title: {
    textAlign: 'center',
    color: '#fdfdfd',
    fontSize: 25,
    textShadowColor: 'black', 
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 1,
  },
  subtitle: {
    textAlign: 'center',
    color: '#fdfdfd',
    fontSize: 16,
    fontWeight: '100',
    fontStyle: 'italic'
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(30, 42, 54, 0.4)'
  },
  border: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: 5,
    bottom: 5,
    borderWidth: 0.5,
    borderColor: 'rgba(253, 253, 253, 0.2)',
    borderRadius: 20
  },
  image: {
    height: 150,
    width: null,
    borderRadius: 10
  }
};