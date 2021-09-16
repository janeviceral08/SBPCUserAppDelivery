import React, { Component } from "react";
import {StyleSheet, FlatList, TouchableOpacity,BackHandler, Alert} from 'react-native';
import { Container, Header, Content, Icon, Accordion, Text, View, Card, CardItem, Thumbnail, Body, Left, Right, Button,List,ListItem, Tabs, Tab , ScrollableTab } from "native-base";
import Ionicons from 'react-native-vector-icons/Ionicons'
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from "../components/Loader";
import CustomHeader from './Header';

import Pending from './orders/Pending';
import Processing from './orders/Processing';
import Delivered from './orders/Delivered';
import Cancelled from './orders/Cancelled';

export default class OrderScreen extends Component {
 constructor() {
    super();
    this.ref =  firestore();
    this.unsubscribe = null;
    this.state = {
      user: null,
      email: "",
      password: "",
      formValid: true,
      error: "",
      loading: false,
      dataSource: [],
      uid:''
    };
     }
    
     onCollectionUpdate = (querySnapshot) => {
      const orders = [];
      querySnapshot.forEach((doc) => {
       orders.push ({
              datas : doc.data(),
              key : doc.id
              });
      })
      this.setState({
        dataSource : orders,
        loading: false,
  
     })
    }
 
    _bootstrapAsync =async () =>{
      const userId= await AsyncStorage.getItem('uid');
      this.unsubscribe = this.ref.collection('orders').where('userId', '==', userId ).orderBy('OrderNo', 'asc').onSnapshot(this.onCollectionUpdate) ;
      this.setState({ 'uid': userId, loading: false })
      };
 

    componentDidMount() {
      this.setState({loading: true})
      this._bootstrapAsync();
    }

  render() {
    console.log('this.state.dataSource: ', this.state.dataSource)
    return (
      <Container  style={{flex: 1}}>
      <CustomHeader title="Order History" isHome={true} Cartoff={true} navigation={this.props.navigation}/>
        <Tabs renderTabBar={()=> <ScrollableTab style={{ backgroundColor: "white" }} />}>
          <Tab heading="Pending" tabStyle={{backgroundColor: '#FFFFFF', borderRadius: 20}} textStyle={{color: 'tomato'}} activeTabStyle={{ height: 35,backgroundColor: 'salmon',borderRadius: 20,marginTop: 10,}} activeTextStyle={{color: '#fff', fontWeight: 'normal'}}>
            <Pending orders={this.state.dataSource} uid={this.state.uid} navigation={this.props.navigation}/>
          </Tab>
          <Tab heading="Processing" tabStyle={{backgroundColor: '#FFFFFF'}} textStyle={{color: 'tomato'}} activeTabStyle={{ height: 35,backgroundColor: 'salmon',borderRadius: 20,marginTop: 10,}} activeTextStyle={{color: '#fff', fontWeight: 'normal'}}>
            <Processing orders={this.state.dataSource} uid={this.state.uid} navigation={this.props.navigation}/>
          </Tab>
          <Tab heading="Delivered" tabStyle={{backgroundColor: '#FFFFFF'}} textStyle={{color: 'tomato'}} activeTabStyle={{ height: 35,backgroundColor: 'salmon',borderRadius: 20,marginTop: 10,}} activeTextStyle={{color: '#fff', fontWeight: 'normal'}}>
            <Delivered orders={this.state.dataSource} uid={this.state.uid} navigation={this.props.navigation}/>
          </Tab>     
          <Tab heading="Cancelled" tabStyle={{backgroundColor: '#FFFFFF'}} textStyle={{color: 'tomato'}} activeTabStyle={{ height: 35,backgroundColor: 'salmon',borderRadius: 20,marginTop: 10,}} activeTextStyle={{color: '#fff', fontWeight: 'normal'}}>
            <Cancelled orders={this.state.dataSource} uid={this.state.uid} navigation={this.props.navigation}/>
          </Tab>    
        </Tabs>
      </Container>
    );
  }
}


const styles = StyleSheet.create({
      stepIndicator: {
      marginVertical: 10
    },
    container: {
       
      alignItems: 'center', 
      justifyContent: 'center'
    },
    
    })