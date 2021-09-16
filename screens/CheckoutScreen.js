import React, { Component } from 'react';
import {StyleSheet, TextInput, TouchableOpacity, Dimensions, Alert, Image, FlatList, SafeAreaView, ScrollView} from 'react-native'
import { Container, View, Left, Right, Button, Icon, Grid, Col, Badge, Card, CardItem, Body,Item, Input,List, ListItem, Thumbnail,Text,Form, Textarea,Toast, Root } from 'native-base';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
// Our custom files and classes import
const SCREEN_WIDTH = Dimensions.get('window').width;
import AccountInfo from './checkout/AccountInfo';
import DeliveryDetails from './checkout/DeliveryDetails';
import { RadioButton, Chip, Divider } from 'react-native-paper';
//import { StackActions, NavigationActions } from 'react-navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from "moment";
import Modal from 'react-native-modal';
import TearLines from "react-native-tear-lines";  
import NumberFormat from 'react-number-format';
import Loader from '../components/Loader';
import CustomHeader from './Header';
import SegmentedControlTab from 'react-native-segmented-control-tab';

/*const resetAction = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'Home' })],
});*/

export default class Checkout extends Component {
  constructor(props) {
      super(props);
      this.updateref =  firestore();
      this.updatecounts =  firestore();
      this.updateUserOrders =  firestore();
      this.checkoutref =  firestore();
      this.storeRef  =   firestore(); 
      this.paymentsRef  =   firestore(); 
      this.billingRef  =   firestore();
      this.paymentMethodRef =  firestore();
      this.ordercounters =  firestore();
      this.chargeref =  firestore().collection('charges').where('status', '==', 'on process' );
      console.log('params: ', this.props.route.params)
      const cart = this.props.route.params.cartItems; 
      const subtotal = this.props.route.params.subtotal; 
      this.state = {  
      cartItems: cart,
      driver_charge: 0,
      xtra: 0,
      labor: 0,
      deliveryCharge: 0,
      pickup: 0,
      stores:[],
      paymentMethod: 'Cash on Delivery (COD)',
      billing_name: '',
      billing_postal: '',
      billing_phone: '',
      billing_street: '',
      billing_country: '',
      billing_province: '',
      billing_city: '',
      billing_barangay: '',
      billing_cluster: '',
      preffered_delivery_time: '',
      currentDate: new Date(),
      visibleModal: false,
      isVisible: false,
      payments: [],
      methods: [],
      palawan_name: '',
      palawan_number: '',
      bank_number: '',
      bank_name: '',
      gcash_number: '',
      counter: 0,
      account_name: '',
      account_address: '',
      account_city: '',
      account_barangay: '',
      account_province: '',
      account_email: '',
      account_number: '',
      account_cluster: '',
      account_status:'',
      paypal_email:'',
      paypal_uname:'',
      note:'',
      vouchers: [],
      discount: 0,
      voucherArray: [],
      charge: 0,
      xtraCharge: 0,
      voucherCode: '',
      loading: false,
      address_list:[],
      visibleAddressModal: false,
      subtotal: subtotal,
      minimum: 0,
      selectedIndex: 0,
      selectedIndices: [0],  
      customStyleIndex: 0,
  };

  }


  checkbarangay(data) {
    const ref =  firestore().collection('barangay').doc(data);

    ref.get().then((doc) => {
      if (doc.exists) {
        const data = doc.data();
        this.setState({
          barangay_km: data.kilometer,
          barangay_status: data.status ,
          charge : data.charge ,
          selectedBarangayCluster: data.cluster    
        });
        this.calculateXtraKm(data.charge, data.cluster);
      } 
    });
    
  }

  getClusterMinimum() {
    const {cartItems} = this.state;
    var result = cartItems.map(el => el.cluster);
    let cluster = result[0];

    const ref =  firestore().collection('cluster').doc(cluster);

    ref.get().then((doc) => {
      if (doc.exists) {
        const data = doc.data();
        this.setState({
           minimum: data.minimum
        });
      } 
    });

  }


  async component (){
    let userId= await AsyncStorage.getItem('uid');
    const self = this;

			/* This will also be triggered when new items are added to or removed from cart  */
			self.unsubscribeCartItems =  firestore().collection('user_vouchers').doc(userId).onSnapshot(snapshot => {
				let updatedCart = []; /* Set empty array cart by default */
				
				if(snapshot.data() && Object.keys(snapshot.data()).length){
					/* Loop through list of cart item IDs  */
					Object.values(snapshot.data()).forEach(function (snapshotCart, index) {
							updatedCart.push({...snapshotCart});
							self.setState({vouchers: updatedCart, loading: false}); /* !!!! setState is running multiple times here, figure out how to detect when child_added completed*/
					
					});
				} else {
					self.setState({vouchers: [], loading: false})
				}
      });
    
  }

  checkVoucherDetails(data){
    const { voucherArray } = this.state;
    let total = 0;
    let discount = this.state.discount;
    if(this.state.voucherCode != data.id || !this.state.voucherCode){
    this.state.cartItems.forEach((item) => {

      if(item.storeId == data.store_id){
        if(item.sale_price){

        }else{
          total += item.price * item.qty

        }
      }
    })
    if(total >= parseInt(data.minimum)){
      this.setState({discount: data.amount, voucherCode: data.id , isVisible: false})
    }else{
      Toast.show({
                      text: "Inapplicable Voucher",
                      position: "center",
                      type: "warning",
                      textStyle: { textAlign: "center" },
                })
      this.setState({isVisible: false})
    }

  }else{
    Alert.alert(
      'Voucher already in-use.',
      '',
      [
        {text: 'OK'},
      ]
    )
    this.setState({isVisible: false})
  }
 
  }

  componentDidMount() {
    this.setState({loading: true})
    this._bootstrapAsync();
    this.subscribe = this.chargeref.onSnapshot(this.onCollectionUpdateCharge);
    this.storeID();
    this.storeIDS();
    this.component();
    this.getClusterMinimum();
  }
  
  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe();
    this.subscribe && this.subscribe();
    this.billinglistener && this.billinglistener();
    this.paymentslistener && this.paymentslistener();
    this.paymentsmethodlistener && this.paymentsmethodlistener();
    this.ordercounters && this.ordercounters();
  }
  
  cartCount () {
    let total = 0
    this.state.cartItems.forEach((item) => {
      total += item.qty;
    })

    return total;
  }
  
_bootstrapAsync =async () =>{
  const userId= await AsyncStorage.getItem('uid');
  this.billinglistener = this.billingRef.collection('users').where('userId','==', userId).onSnapshot(this.onCollectionUpdateBilling);      
  this.paymentslistener = this.paymentsRef.collection('payment_options').onSnapshot(this.onCPaymentOptionUpdate);   
  this.paymentsmethodlistener = this.paymentMethodRef.collection('payment_methods').onSnapshot(this.onCPaymentMethodUpdate);  
  this.ordercounters = this.ordercounters.collection('orderCounter').onSnapshot(this.OrderCounter); 
  this.setState({ 'uid': userId })
  };


  
   onCPaymentMethodUpdate = (querySnapshot) => {
    const methods = [];
    querySnapshot.forEach((doc) => {
      this.setState({
        palawan_name: doc.data().palawan_receiver,
        palawan_number: doc.data().palawan_number,
        bank_number: doc.data().bank_number,
        bank_name: doc.data().bank_name,
        gcash_number: doc.data().gcash_number,
        bank_name2 : doc.data().bank_name2,
        bank_number2: doc.data().bank_number2,
        paypal_uname: doc.data().paypal_uname,
        paypal_email: doc.data().paypal_email
     });
    });

  }

  onCPaymentOptionUpdate = (querySnapshot) => {
    const payments = [];
    querySnapshot.forEach((doc) => {
      payments.push ({
            datas : doc.data(),
            key : doc.id
            });
    });
    this.setState({
      payments : payments,    
   });

  }


  OrderCounter = (querySnapshot) => {
    querySnapshot.forEach((doc) => {
      this.setState({
        counter : doc.data().counter,    
     });
    });
  

  }


     
  onCollectionUpdateBilling = (querySnapshot) => {
  querySnapshot.forEach((doc) => {
    this.setState({
      account_name: doc.data().Name,
      account_address: doc.data().Address.Address,
      account_city: doc.data().Address.City,
      account_barangay: doc.data().Address.Barangay,
      account_province: doc.data().Address.Province,
      account_email: doc.data().Email,
      account_number: doc.data().Mobile,
      account_cluster: doc.data().Address.Cluster,
      account_status: doc.data().status,
      address_list : Object.values(doc.data().Shipping_Address)
    });
 
    
  });
  this.defaultShippingAddress();
  }

   onCollectionUpdateCharge = (querySnapshot) => {
    querySnapshot.forEach((doc) => {
     this.setState({
       driver_charge: doc.data().driverCharge,
       xtra: doc.data().extra_charge,
       labor: doc.data().labor_charge,
       deliveryCharge: doc.data().del_charge,
       pickup: doc.data().pickup_charge
    });
    
            
    });
    
    }

 

  async calculateXtraKm(charge, clustering){
    let total =0
    const cluster = await AsyncStorage.getItem('cluster');

   if(clustering == cluster){
      total=0;
   }else{
     total = charge;
   }
   this.setState({xtraCharge : total})
  }

  calculateOverAllTotal () {
    const { paymentMethod, minimum, selectedIndex, selectedIndices, customStyleIndex } = this.state;
    let total = 0
    if(customStyleIndex === 0){
      if(Math.round(this.state.subtotal*10)/10 >= this.state.minimum){
        total = this.state.subtotal + this.state.xtraCharge;
      }else{
        total = this.state.subtotal + this.calculateTotalDeliveryCharge() + this.state.xtraCharge;
      }
    }else if(customStyleIndex === 1){
      total = this.state.subtotal + this.state.xtraCharge;
    } 
    return total;
  }
   
  calculateLaborCharge () {
    let total = 0
     this.state.cartItems.forEach((item) => {
       if(item.sale_price){
           total +=  (item.qty * item.sale_price) * item.labor_charge
       }else{
           total +=  (item.qty * item.price) * item.labor_charge
       }       
      })
    return total;
  }

  calculatePickupCharge () {
    let total = 0

      total = this.state.pickup * this.storeID().length
     return total;
  }

  calculateTotalDeliveryCharge(){
    let total = 0;

    total = this.calculateLaborCharge() + this.calculatePickupCharge() + this.state.deliveryCharge;

    return total;
  }

  storeIDS (){
      let store={};
      this.state.cartItems.forEach((item) => {    
        store[item.storeId] = "Pending";
      })
  
        return store;
   }

  storeID (){
    let store=[];
    let uniqueArray=[];
     this.state.cartItems.forEach((item) => {    
       store.push(item.storeId)
     })
     for(var value of store){
      if(uniqueArray.indexOf(value) === -1){
          uniqueArray.push(value);
      }
  }

      return uniqueArray;
   }

   token (){
    let store=[];
    let uniqueArray=[];
     this.state.cartItems.forEach((item) => {    
       store.push(...item.notification_token)
     })
     for(var value of store){
      if(uniqueArray.indexOf(value) === -1){
          uniqueArray.push(value);
      }
  }
     return uniqueArray;
   }

defaultShippingAddress(){

   this.state.address_list.forEach((item) => {    
      if(item.default){
           this.setState({
            billing_name: item.name,
            billing_phone: item.phone,
            billing_province: item.province,
            billing_barangay: item.barangay,
            billing_city: item.city,
            billing_street: item.address,
            billing_postal: item.postal
          })
          this.checkbarangay(item.barangay);
      }
      
     })
  
}

   OrderSuccess (){
    this.props.navigation.reset({
    index: 0,
    routes: [{ name: 'Home' }],})
    this.setState({visibleModal: false});
   }


changeAddress(item){
  this.setState({
    billing_name: item.name,
    billing_phone: item.phone,
    billing_province: item.province,
    billing_city: item.city,
    billing_street: item.address,
    billing_postal: item.postal,
    billing_barangay: item.barangay,
    visibleAddressModal: false
  })
  this.checkbarangay(item.barangay);
}

changePaymentMethod(item){
  this.setState({
    paymentMethod: item.datas.label,
    visiblePaymentModal: false
  })
}

handleCustomIndexSelect = (index: number) => {
  //handle tab selection for custom Tab Selection SegmentedControlTab
  this.setState(prevState => ({ ...prevState, customStyleIndex: index }));
};

navigateAddress(){
  this.setState({visibleAddressModal: false})
  this.props.navigation.navigate('Address')
}

 footer= () => {
    return(
    <View>
      <Button block  style={{alignSelf:'center', backgroundColor:'salmon'}}  onPress={()=>this.navigateAddress() }>
            <Text style={{color: 'white'}}>Add Address</Text>
      </Button>
    </View>
    )
  }


  render() {
    const { paymentMethod, minimum, selectedIndex, selectedIndices, customStyleIndex } = this.state;
  
    return(
        <Root>
          <Container style={{backgroundColor: '#CCCCCC'}}>   
          <CustomHeader title="Checkout"  Cartoff={true} navigation={this.props.navigation}/>
          <Loader loading={this.state.loading}/>     
          <SegmentedControlTab
              values={['Door-to-door', 'Pick-up']}
              selectedIndex={customStyleIndex}
              onTabPress={this.handleCustomIndexSelect}
              borderRadius={0}
              tabsContainerStyle={{ height: 50, backgroundColor: '#F2F2F2' }}
              tabStyle={{
                backgroundColor: '#F2F2F2',
                borderWidth: 0,
                borderColor: 'transparent',
              }}
              activeTabStyle={{ backgroundColor: 'white', marginTop: 2 }}
              tabTextStyle={{ color: '#444444', fontWeight: 'bold' }}
              activeTabTextStyle={{ color: '#888888' }}
            />  
            {customStyleIndex === 0 && (    
            <ScrollView>
                      
                <SafeAreaView >
               <Card  elevation={5} style={{borderColor: '#ddd', padding: 5, flex:1}}>
                     <CardItem header>    
                        <Text style={{fontSize: 16,fontWeight:'bold', color: '#1aad57'}}>Delivery Details</Text>    
                        <Body />
                        <Right style={{flexDirection: 'row', justifyContent:'flex-end'}}>
                            <TouchableOpacity style={{ paddingRight: 5}} onPress={()=> this.setState({visibleAddressModal: true})}>
                                <Text style={{color:'red',fontStyle:'italic'}}>Edit</Text>
                            </TouchableOpacity>
                           
                        </Right>
                    </CardItem>
                    {!this.state.loading &&
                    <View style={{flex: 1, flexDirection: 'column', paddingHorizontal: 10}}>
                              <Text style={{fontSize: 14}}>{this.state.billing_name} | {this.state.billing_phone} {"\n"}{this.state.billing_street}, {this.state.billing_barangay}, {this.state.billing_city}, {this.state.billing_province}, {this.state.billing_postal}</Text>
                    </View>}
                </Card> 
                 <Modal
                  useNativeDriver={true}
                  isVisible={this.state.visibleAddressModal}
                  onSwipeComplete={this.close}
                  swipeDirection={['up', 'left', 'right', 'down']}
                  style={styles.view}
                  onBackdropPress={() => this.setState({visibleAddressModal: false})} transparent={true}>
                <View style={styles.content}> 
                    <View>
                      <Text style={{textAlign:'center', paddingVertical: 15}}> Select Address </Text>
                      <FlatList
                          data={this.state.address_list}
                          ListFooterComponent={this.footer}
                          renderItem={({ item }) => 
                          <Card transparent>
                          <CardItem style={{borderRadius: 10, borderWidth: 0.1, marginHorizontal: 10, borderColor: 'tomato'}} button onPress={()=> this.changeAddress(item)}>                     
                            <View style={{flex: 1, flexDirection: 'column'}}>
                              <Text style={{fontSize: 14}}>{item.name} | {item.phone} {"\n"}{item.address}, {item.barangay}, {item.city}, {item.province}, {item.postal}</Text>
                            </View>              
                          </CardItem>
                        </Card>  
                          }
                          keyExtractor={item => item.key}
                      />
                    </View>
                </View>
                </Modal>
            </SafeAreaView>  
                <Card  elevation={5} style={{borderColor: '#ddd', padding: 5, flex:1}}>
                    <CardItem header>
                        <Text style={{fontSize: 18,fontWeight:'bold', color: '#1aad57'}}>Payment Method</Text>
                        <Body />
                        <Right style={{flexDirection: 'row', justifyContent:'flex-end'}}>
                            <TouchableOpacity style={{ paddingRight: 5}} onPress={()=> this.setState({visiblePaymentModal: true})}>
                                <Text style={{color:'red',fontStyle:'italic'}}>Edit</Text>
                            </TouchableOpacity>
                           
                        </Right>
                    </CardItem>

                         <View style={{flexDirection: 'row'}}>
                         <RadioButton
                         value={this.state.paymentMethod}
                         status={'checked'}
                         />
                         
                         <Text style={{padding: 5}}>{this.state.paymentMethod}</Text>
                     </View>
                    <Modal 
                      useNativeDriver={true}
                      isVisible={this.state.visiblePaymentModal}
                      onSwipeComplete={this.close}
                      swipeDirection={['up', 'left', 'right', 'down']}
                      style={styles.view}
                      onBackdropPress={() => this.setState({visiblePaymentModal: false})} transparent={true}
                    >
                      <View style={styles.content}> 
                    <View>
                      <Text style={{textAlign:'center', paddingVertical: 15}}> Select Payment Method </Text>
                      <FlatList
                          data={this.state.payments}
                          renderItem={({ item }) => 
                          <Card transparent>
                          <CardItem style={{borderRadius: 10, borderWidth: 0.1, marginHorizontal: 10, borderColor:'tomato'}} button onPress={()=> this.changePaymentMethod(item)}>                     
                            <View style={{flex: 1, flexDirection: 'column'}}>
                              <Text style={{fontSize: 14}}> {item.datas.label}</Text>
                            </View>                    
                          </CardItem>
                        </Card>  
                          }
                          keyExtractor={item => item.key}
                      />
                    </View>
                </View>
                    </Modal>
                    {paymentMethod === 'GCash' && 
                    <Form style={{paddingLeft: 20, paddingRight: 20, paddingVertical: 10}}>
                        <Item regular style={{marginTop: 5, paddingLeft:10,height:30}}>
                            <Text style={{color:'gray', fontSize: 14}}>Send to:</Text>
                            <Input  placeholderTextColor="#687373"  value={this.state.gcash_number}  disabled/>
                        </Item>
                        <Text style={{color: 'tomato', fontSize: 14}}>***Please email the photo/screenshot of your payment receipt/transaction to kusinahanglan@gmail.com.</Text>
                    </Form>}
                    {paymentMethod === 'Bank Transfer' && 
                    <Form style={{paddingLeft: 20, paddingRight: 20, paddingVertical: 10}}>
                        <Text>Bank Option 1</Text>
                        <Item regular style={{marginTop: 5, paddingLeft:10,height:30}}>
                            <Text style={{color:'gray', fontSize: 14}}>Bank Name:</Text>
                            <Input  style={{fontSize: 16}}   placeholderTextColor="#687373"  value={this.state.bank_name} numberOfLines={2} disabled/>
                        </Item>
                        <Item regular style={{marginTop: 5, paddingLeft:10,height:30}}>
                            <Text style={{color:'gray', fontSize: 14}}>Accnt. Number:</Text>
                            <Input style={{fontSize: 16}}    placeholderTextColor="#687373"  value={this.state.bank_number} numberOfLines={2} disabled/>
                        </Item>
                        <Text>Bank Option 2</Text>
                        <Item regular style={{marginTop: 5, paddingLeft:10,height:30}}>
                            <Text style={{color:'gray', fontSize: 13}}>Bank Name:</Text>
                            <Input style={{fontSize: 16}}    placeholderTextColor="#687373"  value={this.state.bank_name2} numberOfLines={2} disabled/>
                        </Item>
                        <Item regular style={{marginTop: 5, paddingLeft:10,height:30}}>
                            <Text style={{color:'gray' , fontSize: 13}}>Accnt. Number:</Text>
                            <Input style={{fontSize: 16}}    placeholderTextColor="#687373"  value={this.state.bank_number2} numberOfLines={2}  disabled/>
                        </Item>
                       <Text style={{color: 'tomato', fontSize: 14}}>***Please email the photo/screenshot of your payment receipt/transaction to kusinahanglan@gmail.com.</Text>
                    </Form>}
                    {paymentMethod === 'Palawan Remittance' && 
                    <Form style={{paddingLeft: 20, paddingRight: 20, paddingVertical: 10}}>
                        <Item regular style={{marginTop: 5, paddingLeft:10,height:30}}>
                            <Text style={{color:'gray', fontSize: 14}}>Receiver Name:</Text>
                            <Input style={{fontSize: 16}}  placeholderTextColor="#687373"  value={this.state.palawan_name}  disabled numberOfLines={2}/>
                        </Item>
                        <Item regular style={{marginTop: 5, paddingLeft:10,height:30}}>
                            <Text style={{color:'gray', fontSize: 13}}>Receiver Number:</Text>
                            <Input value={this.state.palawan_number}  disabled numberOfLines={2}/>
                        </Item>
                       <Text style={{color: 'tomato', fontSize: 14}}>***Please email the photo/screenshot of your payment receipt/transaction to kusinahanglan@gmail.com.</Text>
                    </Form>}
                    {paymentMethod === 'Paypal' && 
                    <Form style={{paddingLeft: 20, paddingRight: 20, paddingVertical: 10}}>
                        <Item regular style={{marginTop: 5, paddingLeft:10,height:30}}>
                            <Text style={{color:'gray', fontSize: 14}}>Paypal Email:</Text>
                            <Input style={{fontSize: 16}}  placeholderTextColor="#687373"  value={this.state.paypal_email}  disabled numberOfLines={2}/>
                        </Item>
                        <Item regular style={{marginTop: 5, paddingLeft:10,height:30}}>
                            <Text style={{color:'gray', fontSize: 13}}>Paypal Username:</Text>
                            <Input value={this.state.paypal_uname}  disabled numberOfLines={2}/>
                        </Item>
                       <Text style={{color: 'tomato', fontSize: 14}}>***Please email the photo/screenshot of your payment receipt/transaction to kusinahanglan@gmail.com.</Text>
                    </Form>}
                </Card> 
                <View> 
        <TearLines  ref="top"/>
            <View style={styles.invoice}  onLayout={(e) => {
                  
                    this.refs.top.onLayout(e);
                    }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1aad57'}}>Billing Receipt</Text>

                    <List>
                       <FlatList
                          data={this.state.cartItems}
                          renderItem={({ item }) => 
                              <View style={{paddingVertical: 15}}>
                                {!item.sale_price ? 
                                      <View style={{flexDirection: 'row'}}>
                                      <Body style={{flex:1,justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                                      <Text style={{fontSize: 10, fontWeight: 'bold'}}>
                                          {item.name}
                                        </Text>
                                        <Text note style={{fontSize: 10}}>
                                          {item.qty} {item.unit} x
                                          ₱{item.price}
                                        </Text>
                                        <Text note style={{fontSize: 10}}>Brand: {item.brand}</Text>
                                        <Text note style={{fontSize: 10}}>by {item.store_name}</Text>
                                      </Body>
                                      <Right style={{textAlign: 'right'}}>
                                      {item.choice == null || item.choice == [] ? 
                                            <Text style={{fontSize: 10, fontWeight: 'bold', marginBottom: 10}}>₱{Math.round((item.price * item.qty)*10)/10}</Text>
                                          :
                                            <Text style={{fontSize: 10, fontWeight: 'bold', marginBottom: 10}}>₱{Math.round(((item.price * item.qty)+(item.total_addons*item.qty))*10)/10}</Text>
                                          }
                                        
                                      </Right>
                                      </View> :
                                      <View style={{flexDirection: 'row'}}>
                                      <Body style={{flex:1,justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                                      <Text style={{fontSize: 10, fontWeight: 'bold'}}>
                                          {item.name}
                                        </Text>
                                        <Text note style={{fontSize: 10}}>
                                          {item.qty} {item.unit} x <Text style={{textDecorationLine: 'line-through', fontSize: 10}}> ₱{item.price}</Text> 
                                          ₱{item.sale_price}
                                        </Text>
                                        <Text note style={{fontSize: 10}}>Brand: {item.brand}</Text>
                                        <Text note style={{fontSize: 10}}>by {item.store_name}</Text>
                                      </Body>
                                      <Right style={{textAlign: 'right'}}>
                                      {item.choice == null || item.choice == []? 
                                          <Text style={{fontSize: 10, fontWeight: 'bold', marginBottom: 10}}>₱{Math.round((item.sale_price * item.qty)*10)/10}</Text>
                                        :
                                          <Text style={{fontSize: 10, fontWeight: 'bold', marginBottom: 10}}>₱{Math.round(((item.sale_price * item.qty)+(item.total_addons*item.qty))*10)/10}</Text>
                                        }
                                      </Right>
                                      </View> } 
                               </View>
                          }
                          keyExtractor={item => item.key}
                      />
                    </List>

                    <View>
                        <Grid style={{padding: 8, flexDirection: 'column'}}>
                            <Col>
                                <Text style={{fontSize: 13,  color:'tomato'}}>You have ordered <Text style={{textDecorationLine: 'underline', color: 'tomato', fontSize: 13, fontWeight: 'bold' }}>{this.cartCount()}</Text>  item/s from <Text style={{textDecorationLine: 'underline', color: 'tomato', fontSize: 13, fontWeight: "bold" }}>{this.storeID().length}</Text> store/s</Text>
                            </Col>
                            <Col>
                                <Text style={{fontSize: 13,  color:'red', fontWeight:'bold'}}>FREE DELIVERY when you reached ₱{minimum}</Text>
                            </Col>
                        </Grid>
                        <Grid style={{padding: 8}}>
                            <Col>
                                <Text style={{fontSize: 13,  color:'green'}}>Sub Total</Text>
                            </Col>
                            <Col>
                            <NumberFormat  renderText={text => <Text style={{textAlign: 'right',fontSize: 13,  color:'green'}}>{text}</Text>} value={Math.round(this.state.subtotal*10)/10} displayType={'text'} thousandSeparator={true} prefix={'₱'} />
              
                            </Col>
                        </Grid>
                        <Grid  style={{padding: 8}}>
                            <Col>
                                <Text style={{fontSize: 13,  color:'green'}}>Delivery Charge</Text>
                            </Col>
                            <Col>
                            {Math.round(this.state.subtotal*10)/10 >= minimum ? 
                              <NumberFormat  renderText={text => <Text style={{textAlign: 'right',fontSize: 13,  color:'green'}}>{text}</Text>} value={0} displayType={'text'} thousandSeparator={true} prefix={'₱'} />  
                              :
                              <NumberFormat  renderText={text => <Text style={{textAlign: 'right',fontSize: 13,  color:'green'}}>{text}</Text>} value={Math.round(this.calculateTotalDeliveryCharge()*10)/10} displayType={'text'} thousandSeparator={true} prefix={'₱'} />
                            }
                            
                            </Col>
                        </Grid>
                        <Grid  style={{padding: 8}}>
                            <Col>
                                <Text style={{fontSize: 13,  color:'green'}}>Extra Kilometer Charge</Text>
                            </Col>
                            <Col>
                  <Text style={{textAlign: 'right', fontSize: 13 ,color: 'green'}}>₱{Math.round(this.state.xtraCharge)}</Text>            
                            </Col>
                        </Grid>
                        {this.state.discount != 0 ?
                        <Grid  style={{padding: 8}}>
                         
                            <Col>
                                <Text style={{fontSize: 13,  color:'tomato'}}>Discount</Text>
                            </Col>
                            <Col>
                  <Text style={{textAlign: 'right', fontSize: 13 ,color: 'tomato'}}> - ₱{this.state.discount}</Text>            
                            </Col>     
                        </Grid> : null
                             }
                        <View style={styles.line} />
                        <Grid  style={{padding: 8}}>
                            <Col>
                                <Text style={{fontSize: 13,  color:'green'}}>Total</Text>
                            </Col>
                            <Col>                        
                                 <Text style={{textAlign: 'right', fontSize: 15 ,color: 'green'}}>₱{(Math.round(this.calculateOverAllTotal()*10)/10) - this.state.discount}</Text>             
                            </Col>
                        </Grid>
                        </View>
                    </View>  
                    
            </View>
            </ScrollView> )}
            {customStyleIndex === 1 && (     
              <ScrollView>
                        
                  <SafeAreaView >
                 <Card  elevation={5} style={{borderColor: '#ddd', padding: 5, flex:1}}>
                       <CardItem header>    
                          <Text style={{fontSize: 16,fontWeight:'bold', color: 'tomato'}}>Pick-up Details</Text>    
                          <Body />
                          <Right style={{flexDirection: 'row', justifyContent:'flex-end'}}>
                              <TouchableOpacity style={{ paddingRight: 5}} onPress={()=> this.setState({visibleAddressModal: true})}>
                                  <Text style={{color:'red', fontStyle:'italic'}}>Edit</Text>
                              </TouchableOpacity>
                             
                          </Right>
                      </CardItem>
                      {!this.state.loading &&
                      <View style={{flex: 1, flexDirection: 'column', paddingHorizontal: 10}}>
                                <Text style={{fontSize: 14}}>{this.state.billing_name} | {this.state.billing_phone} {"\n"}{this.state.billing_street}, {this.state.billing_barangay}, {this.state.billing_city}, {this.state.billing_province}, {this.state.billing_postal}</Text>
                      </View>}
                  </Card> 
                   <Modal
                    useNativeDriver={true}
                    isVisible={this.state.visibleAddressModal}
                    onSwipeComplete={this.close}
                    swipeDirection={['up', 'left', 'right', 'down']}
                    style={styles.view}
                    onBackdropPress={() => this.setState({visibleAddressModal: false})} transparent={true}>
                  <View style={styles.content}> 
                      <View>
                        <Text style={{textAlign:'center', paddingVertical: 15}}> Select Address </Text>
                        <FlatList
                            data={this.state.address_list}
                            ListFooterComponent={this.footer}
                            renderItem={({ item }) => 
                            <Card transparent>
                            <CardItem style={{ borderWidth: 0.1, marginHorizontal: 10, borderColor: 'tomato'}} button onPress={()=> this.changeAddress(item)}>                     
                              <View style={{flex: 1, flexDirection: 'column'}}>
                                <Text style={{fontSize: 12}}>{item.name} | {item.phone} {"\n"}{item.address}, {item.barangay}, {item.city}, {item.province}, {item.postal}</Text>
                              </View>              
                            </CardItem>
                          </Card>  
                            }
                            keyExtractor={item => item.key}
                        />
                      </View>
                  </View>
                  </Modal>
              </SafeAreaView>  
                  <Card  elevation={5} style={{borderColor: '#ddd', padding: 5, flex:1}}>
                      <CardItem header>
                          <Text style={{fontSize: 18,fontWeight:'bold', color: '#1aad57'}}>Payment Method</Text>
                          <Body />
                          <Right style={{flexDirection: 'row', justifyContent:'flex-end'}}>
                              <TouchableOpacity style={{ paddingRight: 5}} onPress={()=> this.setState({visiblePaymentModal: true})}>
                                  <Text style={{color:'red',fontStyle:'italic'}}>Edit</Text>
                              </TouchableOpacity>
                             
                          </Right>
                      </CardItem>
  
                           <View style={{flexDirection: 'row'}}>
                           <RadioButton
                           value={this.state.paymentMethod}
                           status={'checked'}
                           />
                           
                           <Text style={{padding: 5}}>{this.state.paymentMethod}</Text>
                       </View>
                      <Modal 
                        useNativeDriver={true}
                        isVisible={this.state.visiblePaymentModal}
                        onSwipeComplete={this.close}
                        swipeDirection={['up', 'left', 'right', 'down']}
                        style={styles.view}
                        onBackdropPress={() => this.setState({visiblePaymentModal: false})} transparent={true}
                      >
                        <View style={styles.content}> 
                      <View>
                        <Text style={{textAlign:'center', paddingVertical: 15}}> Select Payment Method </Text>
                        <FlatList
                            data={this.state.payments}
                            renderItem={({ item }) => 
                            <Card transparent>
                            <CardItem style={{borderRadius: 10, borderWidth: 0.1, marginHorizontal: 10, borderColor:'tomato'}} button onPress={()=> this.changePaymentMethod(item)}>                     
                              <View style={{flex: 1, flexDirection: 'column'}}>
                                <Text style={{fontSize: 14}}> {item.datas.label}</Text>
                              </View>                    
                            </CardItem>
                          </Card>  
                            }
                            keyExtractor={item => item.key}
                        />
                      </View>
                  </View>
                      </Modal>
                      {paymentMethod === 'GCash' && 
                      <Form style={{paddingLeft: 20, paddingRight: 20, paddingVertical: 10}}>
                          <Item regular style={{marginTop: 5, paddingLeft:10,height:30}}>
                              <Text style={{color:'gray', fontSize: 14}}>Send to:</Text>
                              <Input  placeholderTextColor="#687373"  value={this.state.gcash_number}  disabled/>
                          </Item>
                          <Text style={{color: 'tomato', fontSize: 14}}>***Please email the photo/screenshot of your payment receipt/transaction to kusinahanglan@gmail.com.</Text>
                      </Form>}
                      {paymentMethod === 'Bank Transfer' && 
                      <Form style={{paddingLeft: 20, paddingRight: 20, paddingVertical: 10}}>
                          <Text>Bank Option 1</Text>
                          <Item regular style={{marginTop: 5, paddingLeft:10,height:30}}>
                              <Text style={{color:'gray', fontSize: 14}}>Bank Name:</Text>
                              <Input  style={{fontSize: 16}}   placeholderTextColor="#687373"  value={this.state.bank_name} numberOfLines={2} disabled/>
                          </Item>
                          <Item regular style={{marginTop: 5, paddingLeft:10,height:30}}>
                              <Text style={{color:'gray', fontSize: 14}}>Accnt. Number:</Text>
                              <Input style={{fontSize: 16}}    placeholderTextColor="#687373"  value={this.state.bank_number} numberOfLines={2} disabled/>
                          </Item>
                          <Text>Bank Option 2</Text>
                          <Item regular style={{marginTop: 5, paddingLeft:10,height:30}}>
                              <Text style={{color:'gray', fontSize: 13}}>Bank Name:</Text>
                              <Input style={{fontSize: 16}}    placeholderTextColor="#687373"  value={this.state.bank_name2} numberOfLines={2} disabled/>
                          </Item>
                          <Item regular style={{marginTop: 5, paddingLeft:10,height:30}}>
                              <Text style={{color:'gray' , fontSize: 13}}>Accnt. Number:</Text>
                              <Input style={{fontSize: 16}}    placeholderTextColor="#687373"  value={this.state.bank_number2} numberOfLines={2}  disabled/>
                          </Item>
                         <Text style={{color: 'tomato', fontSize: 14}}>***Please email the photo/screenshot of your payment receipt/transaction to kusinahanglan@gmail.com.</Text>
                      </Form>}
                      {paymentMethod === 'Palawan Remittance' && 
                      <Form style={{paddingLeft: 20, paddingRight: 20, paddingVertical: 10}}>
                          <Item regular style={{marginTop: 5, paddingLeft:10,height:30}}>
                              <Text style={{color:'gray', fontSize: 14}}>Receiver Name:</Text>
                              <Input style={{fontSize: 16}}  placeholderTextColor="#687373"  value={this.state.palawan_name}  disabled numberOfLines={2}/>
                          </Item>
                          <Item regular style={{marginTop: 5, paddingLeft:10,height:30}}>
                              <Text style={{color:'gray', fontSize: 13}}>Receiver Number:</Text>
                              <Input value={this.state.palawan_number}  disabled numberOfLines={2}/>
                          </Item>
                         <Text style={{color: 'tomato', fontSize: 14}}>***Please email the photo/screenshot of your payment receipt/transaction to kusinahanglan@gmail.com.</Text>
                      </Form>}
                      {paymentMethod === 'Paypal' && 
                      <Form style={{paddingLeft: 20, paddingRight: 20, paddingVertical: 10}}>
                          <Item regular style={{marginTop: 5, paddingLeft:10,height:30}}>
                              <Text style={{color:'gray', fontSize: 14}}>Paypal Email:</Text>
                              <Input style={{fontSize: 16}}  placeholderTextColor="#687373"  value={this.state.paypal_email}  disabled numberOfLines={2}/>
                          </Item>
                          <Item regular style={{marginTop: 5, paddingLeft:10,height:30}}>
                              <Text style={{color:'gray', fontSize: 13}}>Paypal Username:</Text>
                              <Input value={this.state.paypal_uname}  disabled numberOfLines={2}/>
                          </Item>
                         <Text style={{color: 'tomato', fontSize: 14}}>***Please email the photo/screenshot of your payment receipt/transaction to kusinahanglan@gmail.com.</Text>
                      </Form>}
                  </Card> 
                  <View> 
          <TearLines  ref="top"/>
              <View style={styles.invoice}  onLayout={(e) => {
                    
                      this.refs.top.onLayout(e);
                      }}>
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1aad57'}}>Billing Receipt</Text>
  
                      <List>
                         <FlatList
                            data={this.state.cartItems}
                            renderItem={({ item }) => 
                                <View style={{paddingVertical: 15}}>
                                  {!item.sale_price ? 
                                        <View style={{flexDirection: 'row'}}>
                                        <Body style={{flex:1,justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                                        <Text style={{fontSize: 10, fontWeight: 'bold'}}>
                                            {item.name}
                                          </Text>
                                          <Text note style={{fontSize: 10}}>
                                            {item.qty} {item.unit} x
                                            ₱{item.price}
                                          </Text>
                                          <Text note style={{fontSize: 10}}>Brand: {item.brand}</Text>
                                          <Text note style={{fontSize: 10}}>by {item.store_name}</Text>
                                        </Body>
                                        <Right style={{textAlign: 'right'}}>
                                          {item.choice == null || item.choice == [] ? 
                                            <Text style={{fontSize: 10, fontWeight: 'bold', marginBottom: 10}}>₱{Math.round((item.price * item.qty)*10)/10}</Text>
                                          :
                                            <Text style={{fontSize: 10, fontWeight: 'bold', marginBottom: 10}}>₱{Math.round(((item.price * item.qty)+(item.total_addons*item.qty))*10)/10}</Text>
                                          }
                                        </Right>
                                        </View> :
                                        <View style={{flexDirection: 'row'}}>
                                        <Body style={{flex:1,justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                                        <Text style={{fontSize: 10, fontWeight: 'bold'}}>
                                            {item.name}
                                          </Text>
                                          <Text note style={{fontSize: 10}}>
                                            {item.qty} {item.unit} x <Text style={{textDecorationLine: 'line-through', fontSize: 10}}> ₱{item.price}</Text> 
                                            ₱{item.sale_price}
                                          </Text>
                                          <Text note style={{fontSize: 10}}>Brand: {item.brand}</Text>
                                          <Text note style={{fontSize: 10}}>by {item.store_name}</Text>
                                        </Body>
                                        <Right style={{textAlign: 'right'}}>
                                        {item.choice == null || item.choice == []? 
                                          <Text style={{fontSize: 10, fontWeight: 'bold', marginBottom: 10}}>₱{Math.round((item.sale_price * item.qty)*10)/10}</Text>
                                        :
                                          <Text style={{fontSize: 10, fontWeight: 'bold', marginBottom: 10}}>₱{Math.round(((item.sale_price * item.qty)+(item.total_addons*item.qty))*10)/10}</Text>
                                        }
                                          </Right>
                                        </View> } 
                                 </View>
                            }
                            keyExtractor={item => item.key}
                        />
                      </List>
  
                      <View>
                          <Grid style={{padding: 8, flexDirection: 'column'}}>
                              <Col>
                                  <Text style={{fontSize: 13,  color:'tomato'}}>You have ordered <Text style={{textDecorationLine: 'underline', color: 'tomato', fontSize: 13, fontWeight: 'bold' }}>{this.cartCount()}</Text>  item/s from <Text style={{textDecorationLine: 'underline', color: 'tomato', fontSize: 13, fontWeight: "bold" }}>{this.storeID().length}</Text> store/s</Text>
                              </Col>
                              <Col>
                                  <Text style={{fontSize: 13,  color:'red',fontWeight:'bold'}}>FREE DELIVERY when you reached ₱{minimum}</Text>
                              </Col>
                          </Grid>
                          <Grid style={{padding: 8}}>
                              <Col>
                                  <Text style={{fontSize: 13,  color:'green'}}>Sub Total</Text>
                              </Col>
                              <Col>
                              <NumberFormat  renderText={text => <Text style={{textAlign: 'right',fontSize: 13,  color:'green'}}>{text}</Text>} value={Math.round(this.state.subtotal*10)/10} displayType={'text'} thousandSeparator={true} prefix={'₱'} />
                
                              </Col>
                          </Grid>
                          <Grid  style={{padding: 8}}>
                              <Col>
                                  <Text style={{fontSize: 13,  color:'green'}}>Delivery Charge</Text>
                              </Col>
                              <Col>        
                                <NumberFormat  renderText={text => <Text style={{textAlign: 'right',fontSize: 13,  color:'green'}}>{text}</Text>} value={0} displayType={'text'} thousandSeparator={true} prefix={'₱'} />    
                              </Col>
                          </Grid>
                          <Grid  style={{padding: 8}}>
                              <Col>
                                  <Text style={{fontSize: 13,  color:'green'}}>Extra Kilometer Charge</Text>
                              </Col>
                              <Col>
                    <Text style={{textAlign: 'right', fontSize: 13 ,color: 'green'}}>₱{Math.round(this.state.xtraCharge)}</Text>            
                              </Col>
                          </Grid>
                          {this.state.discount != 0 ?
                          <Grid  style={{padding: 8}}>
                           
                              <Col>
                                  <Text style={{fontSize: 13,  color:'tomato'}}>Discount</Text>
                              </Col>
                              <Col>
                    <Text style={{textAlign: 'right', fontSize: 13 ,color: 'tomato'}}> - ₱{this.state.discount}</Text>            
                              </Col>     
                          </Grid> : null
                               }
                          <View style={styles.line} />
                          <Grid  style={{padding: 8}}>
                              <Col>
                                  <Text style={{fontSize: 13,  color:'green'}}>Total</Text>
                              </Col>
                              <Col>                        
                                   <Text style={{textAlign: 'right', fontSize: 15 ,color: 'green'}}>₱{(Math.round(this.calculateOverAllTotal()*10)/10) - this.state.discount}</Text>             
                              </Col>
                          </Grid>
                          </View>
                      </View>  
                      
              </View>
              </ScrollView>)}
      
            <View style={{backgroundColor: '#fff', borderTopWidth: 2, borderColor: '#f6f6f6', paddingVertical: 5}}>
            <View style={{flexDirection: 'row'}}>
							<View style={[styles.centerElement, {width: 60}]}>
								<View style={[styles.centerElement, {width: 32, height: 32}]}>
									<MaterialCommunityIcons name="ticket" size={25} color="#f0ac12" />
								</View>
							</View>
							<View style={{flexDirection: 'row', flexGrow: 1, flexShrink: 1, justifyContent: 'space-between', alignItems: 'center'}}>
								<Text>Voucher</Text>
								<View style={{paddingRight: 40}}>
                  <TouchableOpacity onPress={()=> this.setState({isVisible: true})}>
									<Text 
										style={{paddingHorizontal: 10, backgroundColor: '#f0f0f0', height: 25, borderRadius: 4, color:'tomato'}} >Enter Voucher</Text> 
                  </TouchableOpacity>
								</View>
							</View>
						</View>
						<View style={{flexDirection: 'row'}}>
							
							<View style={{flexDirection: 'row', flexGrow: 1, flexShrink: 1, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10}}>
								<View style={{flexDirection: 'row', paddingRight: 20, alignItems: 'center', paddingLeft: 20}}>
									<Text style={{color: '#8f8f8f', paddingRight: 30, fontSize: 17}}>Over-all Total: </Text>
                                    <NumberFormat  renderText={text => <Text style={{ paddingLeft: (SCREEN_WIDTH / 2)- 60, fontWeight: 'bold'}}>{text}</Text>} value={(Math.round(this.calculateOverAllTotal()*10)/10)- this.state.discount} displayType={'text'} thousandSeparator={true} prefix={'₱'} />
								</View>
                
							</View>
              
						</View>
            {customStyleIndex === 0 ?
            	<View style={{ height: 40, alignItems: 'center'}}>
							<TouchableOpacity  style={[styles.centerElement, {backgroundColor: 'salmon', width: SCREEN_WIDTH - 10, height: 40, borderRadius: 5, padding: 10}]} onPress={() => this.checkOut()}>
								<Text style={{color: '#ffffff'}}>Place Order</Text>
							</TouchableOpacity>
            </View>
            :
            <View style={{ height: 32, alignItems: 'center'}}>
            <TouchableOpacity disabled style={[styles.centerElement, {backgroundColor: 'gray', width: SCREEN_WIDTH - 10, height: 40, borderRadius: 5, padding: 10}]} onPress={() => this.checkOut()}>
              <Text style={{color: '#ffffff'}}>Place Order</Text>
            </TouchableOpacity>
          </View>    
          }
					
					</View>
            <Modal
              isVisible={this.state.visibleModal}
              animationInTiming={500}
              animationIn='slideInUp'
              animationOut='slideOutDown'
              animationOutTiming={500}
              useNativeDriver={true}
              onBackdropPress={() => this.OrderSuccess()} transparent={true}>
            <View style={styles.content}>
              <View style={{justifyContent: 'center',alignItems: 'center', paddingVertical: 10}}>
              <Text style={{color:'tomato', fontWeight:'bold'}}>Thank you for using Kusinahanglan!</Text>
              </View>
              <View style={{justifyContent: 'center',alignItems: 'center', paddingVertical: 20}}>
              <Image
                  style={{ height: 150, width: 150}}
                  source={require('../assets/check.png')}
                />
              </View>
              <View style={{justifyContent: 'center',alignItems: 'center', paddingVertical: 10}}>
              <Text style={{color:'black', fontWeight:'bold'}}>Your Order is Queued!</Text>
              <Text style={{color:'black', fontWeight:'600', textAlign: "center"}}>We will communicate with you to verify your order.Please wait patiently.</Text>
              </View>
            <Button block style={{ height: 30, backgroundColor: "salmon"}}
             onPress={()=> this.OrderSuccess()} >
              <Text style={{color: 'white'}}>Ok</Text>
              </Button>
            </View>
            </Modal>
            <Modal
              animationInTiming={500}
            animationIn='slideInUp'
            animationOut='slideOutDown'
            animationOutTiming={500}
            useNativeDriver={true}
              isVisible={this.state.isVisible}
              onBackdropPress={() => this.setState({isVisible: false})} transparent={true}>
            <View style={styles.content}>
              <Text style={{textAlign: 'center'}}>Select Voucher</Text>
              <Divider />
            <FlatList
                    data={this.state.vouchers}
                    renderItem={({ item }) => 
                    <Card transparent>
                      {item.status == "available" &&
                    <CardItem style={{borderWidth: 0.1}}> 
                    <View style={{flexDirection: 'column', paddingRight: 10}}>          
                     <Thumbnail style={{padding: 0, margin: 0, height: 30, width: 30}}  source={{uri: item.store_image}} /> 
                        <Text style={{fontSize: 7, textAlign: 'center'}}>{item.store_name}</Text> 
                     </View> 
                      <Body style={{paddingLeft: 10}}>
                          <Text style={{fontSize: 14, fontWeight:'bold'}}>₱{item.amount} off</Text>
                          <Text note style={{color:'salmon', fontSize: 10}}>Min. Spend {item.minimum}</Text>
                          
                      </Body>
                      <Right style={{justifyContent: "flex-end", alignContent: "flex-end"}}>
                          <TouchableOpacity  onPress={()=> this.checkVoucherDetails(item)}>
                          <Text style={{ color: 'salmon', fontStyle:'italic'}}>Apply</Text>
                          </TouchableOpacity>
                      </Right>

                            </CardItem> }
                  </Card> 
                    }
                    keyExtractor={item => item.id}
                />
            </View>
            </Modal>
          </Container>
          </Root>
    );
  }


  async checkOut(){
    this.setState({loading: true})
    const newDocumentID = this.checkoutref.collection('orders').doc().id;
    const today = this.state.currentDate;
    const timeStamp= new Date().getTime();
    const date_ordered = moment(today).format('MMMM Do YYYY, h:mm:ss a');
    const week_no = moment(today , "MMDDYYYY").isoWeek();
    const time =  moment(today).format('h:mm:ss a');
    const date = moment(today).format('MMMM D, YYYY');
    const day = moment(today).format('dddd');
    const month = moment(today).format('MMMM');
    const year = moment(today).format('YYYY');
    const userId= await AsyncStorage.getItem('uid');
    const token = await AsyncStorage.getItem('token');
    const updatecounts =  firestore().collection('orderCounter').doc('orders');
    const updateUserOrders =  firestore().collection('users').doc(userId);
    const updateNote =  firestore().collection('users').doc(userId);

    this.checkoutref.collection('orders').doc(newDocumentID).set({
     OrderNo : this.state.counter,
     OrderId: newDocumentID,
     OrderStatus: 'Pending',
     AccountInfo: {
       name: this.state.account_name,
       address: this.state.account_address,
       phone: this.state.account_number,
       email: this.state.account_email,
       barangay: this.state.account_barangay,
       city: this.state.account_city,
       province: this.state.account_province,
       status: this.state.account_status,
     },
     Billing: {
       name: this.state.billing_name,
       address: this.state.billing_street,
       phone: this.state.billing_phone,
       barangay: this.state.billing_barangay,
       province: this.state.billing_province,

     },
     Products: this.state.cartItems,
     OrderDetails: {
      Date_Ordered: date_ordered,
      Preffered_Delivery_Time_Date:this.state.preffered_delivery_time,
      Week_No: week_no,
      Year: year,
      Month: month,
      Time: time,
      Date: date,
      Day: day,
      Timestamp: timeStamp
     },
     notification_token : this.token(),
     user_token : token,
     Note: this.state.note,
     StoreIds: this.storeID(),
     Stores: this.storeIDS(),
     PaymentMethod: this.state.paymentMethod,
     DeliveredBy: '',
     isCancelled: false,
     userId: userId,
     subtotal: this.state.subtotal,
     delivery_charge: Math.round(this.calculateOverAllTotal()*10)/10 >= this.state.minimum? 0 : this.calculateTotalDeliveryCharge(),
     extraKmCharge: this.state.xtraCharge,
     discount: this.state.discount,
     voucherUsed: this.state.voucherCode

    }).then((docRef) => {
      this.state.cartItems.forEach((item) => {    
        this.updateref.collection('products').doc(item.id).update({ quantity:   firestore.FieldValue.increment(- item.qty) });
      })   
      
    }).then(
      updatecounts.update({ counter:   firestore.FieldValue.increment(1) }),
      updateUserOrders.update({ ordered_times:   firestore.FieldValue.increment(1) }),
      this.deleteCart(),
      this.onVoucherUse(),
      this.setState({
        loading: false,
        visibleModal: true
      })
    )
  }

  async deleteCart() {
    const userId= await AsyncStorage.getItem('uid');
    AsyncStorage.removeItem('cluster');
     firestore().collection('cart').doc(userId).delete()
    .catch(function(error) {
        console.log("Error deleting documents: ", error);
    });
}

	
 async onVoucherUse () {
      let userId= await AsyncStorage.getItem('uid');
      let cartRef =   firestore().collection('user_vouchers').doc(userId);
      if(this.state.voucherCode){
      /* Get current cart contents */
        cartRef.get().then(snapshot => {
        let updatedCart = Object.values(snapshot.data()); /* Clone it first */
        let itemIndex = updatedCart.findIndex(item => this.state.voucherCode === item.id); /* Get the index of the item we want to delete */
        
        /* Set item quantity */
        updatedCart[itemIndex]['status'] = 'used'; 
        
        /* Set updated cart in firebase, no need to use setState because we already have a realtime cart listener in the componentDidMount() */
        cartRef.set(Object.assign({}, updatedCart));
      });   
  }
}
}


const styles = {
  line: {
    width: '100%',
    height: 1,
    backgroundColor: '#bdc3c7',
    marginBottom: 10,
    marginTop: 10
  },
   view: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  invoice: {
      padding: 20,
      backgroundColor:"#FFFFFF",
      borderWidth: 0.2,
      borderBottomColor: '#ffffff',
      borderTopColor: '#ffffff',

    },
    centerElement: {justifyContent: 'center', alignItems: 'center'},
    content: {
      backgroundColor: 'white',
      padding: 22,
      borderRadius: 4,
      borderColor: 'rgba(0, 0, 0, 0.1)',
    },
};
