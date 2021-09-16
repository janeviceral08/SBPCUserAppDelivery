
import React, { Component } from "react";
import {StyleSheet, FlatList,TouchableOpacity, Alert, ScrollView, TextInput, Dimensions} from 'react-native';
import { Container, Header, Content, Icon, Accordion, Text, View, Card, CardItem, Thumbnail, Body, Left, Right, Button, List } from "native-base";
import firebase from '../firebase/firebase'

import NumberFormat from 'react-number-format';
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import AsyncStorage from '@react-native-community/async-storage';
import CartItems from "../components/CartItems";
import Loader from "../components/Loader";
const SCREEN_WIDTH = Dimensions.get('window').width;
import CustomHeader from './Header';


export default class Cart extends Component {
  constructor(props) {
    super(props);
    this.storeRef  =  firebase.firestore(); 
    this.state = {
     dataSource: [],
     Quantity: 1,
     status: '',
     navigate: false,
     loading: false
    };
}



_bootstrapAsync (){
  firebase.auth().onAuthStateChanged( user => {
    if (user) { 
      this.unsubscribe = this.storeRef.collection('cart').doc(user.uid).collection('products').onSnapshot(this.onCollectionUpdate);
      this.setState({ 'uid': user.uid })
    }else{
    this.setState({
      'uid': '',
      loading: false   
   });
  }
  });
    
  };

  onCollectionUpdate = (querySnapshot) => {
    const stores = [];
    querySnapshot.forEach((doc) => {
     stores.push ({
            datas : doc.data(),
            key : doc.id
            });
    });
    this.setState({
      dataSource : stores, 
      loading: false   
   });
  }

 
  

  componentDidMount() {
    this.setState({loading: true});
    this._bootstrapAsync();
}



componentWillUnmount() {
  this.unsubscribe && this.unsubscribe();

}

  CheckCartStatus(){
    let clickable = true;

    this.state.dataSource.forEach((item) => {
      if(!item.datas.admin_status || item.datas.stock == 0 || !item.datas.status){
        clickable = false;
      }
    })
  
    return clickable;
  }

  cantCheckout(){
    Alert.alert(
      'Remove Unavailable Products',
      'Some products in your cart are unavailable, remove unavailable products to proceed.',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        },
        { text: 'OK', onPress: () => console.log('OK Pressed') }
      ],
      { cancelable: false }
    );
  }
  
   calculateTotalPrice = () => {
    let total = 0
    this.state.dataSource.forEach((item) => {
      if(item.datas.sale_price){
        total += parseInt(item.datas.sale_price) * item.datas.qty
      }else{
        total += parseInt(item.datas.price) * item.datas.qty
      }
     
    })
  
    return total;
  }

  render() {
    const styles = StyleSheet.create({
        centerElement: {justifyContent: 'center', alignItems: 'center'},
    });

    
    return (
      <Container style={{flex: 1}}>
    
         <Loader loading={this.state.loading}/>
        {this.state.uid && this.state.dataSource.length > 0 ?
        <View>
        <Content padder style={{flex: 1, backgroundColor: "#f5f5f5" }}>
          
        <View style={styles.container}>  
      
          <FlatList
              data={this.state.dataSource}
              renderItem={({ item }) => 
              <CartItems items={item} navigation={this.props.navigation}/>
            }
            keyExtractor={(item, index)=> item.datas.store_id.toString()}
            />     

        
     </View>   
      </Content>
      {this.CheckCartStatus() ?
      <View style={{backgroundColor: '#fff', borderTopWidth: 2, borderColor: '#f6f6f6', paddingVertical: 5}}>
					
						<View style={{flexDirection: 'row'}}>
							
							<View style={{flexDirection: 'row', flexGrow: 1, flexShrink: 1, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10}}>
								<View style={{flexDirection: 'row', paddingRight: 20, alignItems: 'center', paddingLeft: 20}}>
									<Text style={{color: '#8f8f8f', paddingRight: 30, fontSize: 20}}>SubTotal: </Text>
                      <NumberFormat  renderText={text => <Text style={{ paddingLeft: (SCREEN_WIDTH / 2)- 60, fontWeight: 'bold'}}>{text}</Text>} value={this.calculateTotalPrice()} displayType={'text'} thousandSeparator={true} prefix={'₱'} />
								</View>
							</View>
						</View>
						<View style={{ height: 32, alignItems: 'center'}}>
							<TouchableOpacity style={[styles.centerElement, {backgroundColor: 'tomato', width: SCREEN_WIDTH - 10, height: 30, borderRadius: 5, padding: 10}]} onPress={() => this.props.navigation.navigate("CheckoutScreen")}>
								<Text style={{color: '#ffffff'}}>Checkout</Text>
							</TouchableOpacity>
						</View>
          </View>:   <View style={{backgroundColor: '#fff', borderTopWidth: 2, borderColor: '#f6f6f6', paddingVertical: 5}}>
					
          <View style={{flexDirection: 'row'}}>
            
            <View style={{flexDirection: 'row', flexGrow: 1, flexShrink: 1, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10}}>
              <View style={{flexDirection: 'row', paddingRight: 20, alignItems: 'center', paddingLeft: 20}}>
                <Text style={{color: '#8f8f8f', paddingRight: 30, fontSize: 20}}>SubTotal: </Text>
                    <NumberFormat  renderText={text => <Text style={{ paddingLeft: (SCREEN_WIDTH / 2)- 60, fontWeight: 'bold'}}>{text}</Text>} value={this.calculateTotalPrice()} displayType={'text'} thousandSeparator={true} prefix={'₱'} />
              </View>
            </View>
          </View>
          <View style={{ height: 32, alignItems: 'center'}}>
            <TouchableOpacity style={[styles.centerElement, {backgroundColor: 'tomato', width: SCREEN_WIDTH - 10, height: 30, borderRadius: 5, padding: 10}]} onPress={()=> this.cantCheckout()}>
              <Text style={{color: '#ffffff'}}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </View>}</View> :
                <View style={{alignItems: 'center', 
                justifyContent: 'center'}}>      
                <Ionicons name="ios-basket" size={70} color="#f0ac12" />
                <Text style={{paddingVertical: 10}}>Your Cart List is Empty</Text>
              </View>
            }
      </Container>
    );
  }
}


const styles = StyleSheet.create({
    container:{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
      stepIndicator: {
      marginVertical: 10
    },
    invoice: {
        padding: 20,
        backgroundColor:"#FFFFFF",
        borderStyle:'dashed',
        borderWidth: 2,
        borderRadius: 1,
      },
      rectangle3: {
        backgroundColor: "#ffffb2",
        margin: 5,
        borderWidth: 0.1
      },
      containers: {
       
        alignItems: 'center', 
        justifyContent: 'center'
      },
    })