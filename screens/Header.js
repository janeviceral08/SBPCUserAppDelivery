import React, { Component } from 'react';
import {View, Image, Dimensions, SafeAreaView, ScrollView } from 'react-native';
import {Container, Header , Left, Right,Body, Button, Title, Text, List, ListItem} from 'native-base';
import CartBadge from '../components/CartBadge';
import Feather from 'react-native-vector-icons/Feather'

class CustomHeader extends Component {
  render(){
      let {title, isHome, Cartoff} = this.props;
    return(
      <Header androidStatusBarColor="#2c3e50" style={{display:'none'}} style={{backgroundColor: 'salmon'}}>
          <Left style={{flex:1}}>
       <Text> &nbsp;</Text>
          </Left>
          <Body style={{flex: 3}}>
            <Title style={{color:'white'}}>{title}</Title>
          </Body>
          <Right style={{flex:1}}>
            {
                !Cartoff ? 
                      <CartBadge navigation={this.props.navigation}/> : null
            }
          </Right>
        </Header>
    )
  }
}

export default CustomHeader;