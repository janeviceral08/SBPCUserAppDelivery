/**
* This is the Product component
**/

// React native and others libraries imports
import React, { Component } from 'react';
import { AsyncStorage, Dimensions, TouchableHighlight, Image} from 'react-native'
import { View, Col, Card, CardItem, Body, Button, Left, ListItem, List, Content, Thumbnail, Right, Text,Grid, Icon } from 'native-base';

import FastImage from 'react-native-fast-image';
import AntDesign from 'react-native-vector-icons/AntDesign'
import styles from './styles';
// Our custom files and classes import

// screen sizing


export default class StoreCard extends Component {
  state = {
   visibleModal: false,
   quantity: 1,
   products:{},
   cartItems:{},
   loading: false,
  };

  render() {
    const status = this.props.product.status
    return(
      <Card  style={{flex:1, marginHorizontal: 20}}>
        {this.props.product.withAddons == true ?
        
        <TouchableHighlight underlayColor='rgba(73,182,77,1,0.9)' onPress={status? () => this.props.navigation.navigate("Fastfood", {'store': this.props.product, "navigation" :this.props.navigation, 'name': this.props.product.name}): null}>
        <View >
        <FastImage
            style={styles.categoriesPhoto} 
            source={{
                uri: this.props.product.foreground,
                headers: { Authorization: 'someAuthToken' },
                priority: FastImage.priority.normal,
            }}
            resizeMode={FastImage.resizeMode.cover}
        />
        {!this.props.product.status ?
         <View style={styles.subtitleclose}>
           <Text style={{color:'#FFFFFF', fontStyle:'italic', fontWeight: 'bold'}}>Store unavailable</Text>
         </View>   :
              null
      }
     
        
          <Text style={styles.categoriesName}>{this.props.product.name}  </Text>          
          <Text note style={styles.categoriesAddress}>{this.props.product.address}-{this.props.product.cluster}</Text>     
        </View>
      </TouchableHighlight> 
        :        
        <TouchableHighlight underlayColor='rgba(73,182,77,1,0.9)' onPress={status? () => this.props.navigation.navigate("Products", {'store': this.props.product, "navigation" :this.props.navigation, 'name': this.props.product.name}): null}>
          <View >
          <FastImage
              style={styles.categoriesPhoto} 
              source={{
                  uri: this.props.product.foreground,
                  headers: { Authorization: 'someAuthToken' },
                  priority: FastImage.priority.normal,
              }}
              resizeMode={FastImage.resizeMode.cover}
          />
          {!this.props.product.status ?
           <View style={styles.subtitleclose}>
             <Text style={{color:'#FFFFFF', fontStyle:'italic', fontWeight: 'bold'}}>Store unavailable</Text>
           </View>   :
                null
        }
       
          
            <Text style={styles.categoriesName}>{this.props.product.name}  </Text>          
            <Text note style={styles.categoriesAddress}>{this.props.product.address}-{this.props.product.cluster}</Text>     
          </View>
      </TouchableHighlight> }    
      </Card>
    );
  }

}
