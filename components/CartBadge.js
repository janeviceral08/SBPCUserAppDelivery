/**
* This is the navbar component
* example of usage:
*   var left = (<Left><Button transparent><Icon name='menu' /></Button></Left>);
*   var right = (<Right><Button transparent><Icon name='menu' /></Button></Right>);
*   <Navbar left={left} right={right} title="My Navbar" />
**/

// React native and others libraries imports
import React, { Component } from 'react';
import { Container, Content, View, Left, Right, Button,  Grid, Col, CardItem, Body, Card, ScrollableTab, Tab, Tabs ,Header,Title,Text} from 'native-base';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Badge } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default class CartBadge extends Component {
  constructor(props) {
    super(props);
    this.storeRef  =   firestore(); 
    this.state = {
      dataSource: [],
      section: this.props.title ,
      loading: false,
      cart:[],
      counts: 0
    };


}

cartCount () {
  const {cart} = this.state;
    let total = 0
    Object.values(cart).forEach((item) => {
      total += item.qty;
    })

    return total;
}

componentDidMount() {

		const {  cart } = this.state;
		const self = this;
       auth().onAuthStateChanged( user => {
    if (user && cart) { 
          this.unsubscribeCartItems =  firestore().collection('cart').doc(user.uid).onSnapshot(snapshotCart => {
                    if(snapshotCart.data()){
                      this.setState({cart: snapshotCart.data()});
                    } else {
                      this.setState({cart: []});
                    }
                  });
    }else{
    this.setState({
      'uid': '',
      loading: false   
   });
  }
  });
		
	}

  render() {
    return(
        <View>
        <Icon.Button name="cart-outline" size={25} color={'white'} backgroundColor="salmon" onPress={() => this.props.navigation.navigate('Cart')}></Icon.Button>
        {this.cartCount() > 0 && (
          <Badge style={{position: 'absolute', top: -3, right: 3, backgroundColor: 'white'}}>
            <Text style={{ color: 'salmon', fontSize: 10, fontWeight: 'bold' }}>
              {this.cartCount() }
            </Text>
          </Badge>
        )}
      </View>
  
    );
  }
}

const styles={
  body: {

    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontFamily: 'Roboto',
    fontWeight: '100'
  }
};

