import React, { Component } from 'react';
import { Text, View, ScrollView, TextInput, Image, TouchableOpacity, StyleSheet, Dimensions,Alert } from 'react-native';
import {Toast, Container, Root, Form, Button,Textarea, Input, Item} from 'native-base';
import NumberFormat from 'react-number-format';
var { width } = Dimensions.get("window")
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { Banner } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
// import icons
import Icon from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modal';
import { SwipeRow } from 'react-native-swipe-list-view';
import CustomHeader from './Header';
import AntDesign from 'react-native-vector-icons/AntDesign';

export default class Cart extends Component {

 constructor(props) {
    super(props);
    this.storeRef  =   firestore(); 
    this.state = {
     dataSource: [],
     Quantity: 1,
     status: '',
     navigate: false,
     loading: false,
     visible: true,
     cart: [],
     ItemNote:'',
     id:'',
     visibleModal: false,
     qtymodal: false,
     qty: 0
    };
}



  	componentDidMount() {

		const {  cart } = this.state;
		const self = this;
    
       auth().onAuthStateChanged( user => {
    if (user && cart) { 

			/* This will also be triggered when new items are added to or removed from cart  */
			self.unsubscribeCartItems =  firestore().collection('cart').doc(user.uid).onSnapshot(snapshot => {
			 /* Set empty array cart by default */
					let updatedCart = [];
				if(snapshot.data() && Object.keys(snapshot.data()).length){
          
					/* Loop through list of cart item IDs  */
					Object.values(snapshot.data()).forEach(function (snapshotCart, index) {
						/* Query the items based on item ID */
						self.unsubscribeProduct =  firestore().collection('products').doc(snapshotCart.id).onSnapshot(snapshotProduct => {
              /* If we receive a change on details of our product, we first check if it exists in our current cart state */
              if(snapshotProduct.addons === null ){
                    let is_existing = updatedCart.find(item => snapshotProduct.id === item.id);
                  if(is_existing){
                    /* If existing, we find the position (index) of this item in our current cart state */
                    let itemIndex = updatedCart.findIndex(item => snapshotProduct.id === item.id);
                    /* Then we remove the item from the current cart state because we will append the updated item in our next code bellow (updatedCart.push())*/
                    updatedCart.splice(itemIndex, 1); 
                  }

                  updatedCart.push({...snapshotCart, ...snapshotProduct.data()});
                  console.log(updatedCart.length)
                  if (index === Object.values(snapshot.data()).length -1){ 
                      self.setState({cart: updatedCart, loading: false}); 
                  }
              }else{
                updatedCart.push({...snapshotCart, ...snapshotProduct.data()});
                console.log(updatedCart.length)
                if (index === Object.values(snapshot.data()).length -1){ 
                    self.setState({cart: updatedCart, loading: false}); 
                }
              }
							/* !!!! setState is running multiple times here, figure out how to detect when child_added completed*/
						});
					});
           
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
	
	/* On unmount, we remove the listener to avoid memory leaks from using the same reference with the off() method: */
	componentWillUnmount() {
    this.unsubscribeCartItems && this.unsubscribeCartItems();
		this.unsubscribeProduct && this.unsubscribeProduct();
	}

  checkAvailability(){
    const {cart} = this.state;
    let status = Object.keys(cart).length && Object.values(cart).find(item => false === item.status); 
    let admin_control = Object.keys(cart).length && Object.values(cart).find(item => false === item.admin_control); 
    let quantity = Object.keys(cart).length && Object.values(cart).find(item => item.quantity <= 0);
    let checkout = true;

    if(status || admin_control || quantity){
      	Alert.alert(
        'Note:',
        'Please remove unavailable products.',
        [
          { text: 'OK'}
        ],
        { cancelable: false }
      );
    }else {
      console.log('cart: ', cart)
      this.props.navigation.navigate('Checkout',{"cartItems": cart, "subtotal" : this.calculateTotalPrice()});
    }
  }



async onUpdateNote(){
  const {cart} = this.state;
  	const userId= await AsyncStorage.getItem('uid');

  let product = Object.keys(cart).length && Object.values(cart).find(item => this.state.id === item.id); /* Check if item exists in cart from state */
            if(product){
                let cartRef =  firestore().collection('cart');
                
                /* Get current cart contents */
                cartRef.doc(userId).get().then(snapshot => {
                  let updatedCart = Object.values(snapshot.data()); /* Clone it first */
                  let itemIndex = updatedCart.findIndex(item => this.state.id === item.id); /* Get the index of the item we want to delete */
                  
                  /* Set item quantity */
                  updatedCart[itemIndex]['note'] = this.state.ItemNote; 
                  
                  /* Set updated cart in firebase, no need to use setState because we already have a realtime cart listener in the componentDidMount() */
                  cartRef.doc(userId).set(Object.assign({}, updatedCart)).then(() => {
                    this.setState({visibleModal: false})
                    Toast.show({
                      text: "Note added succesfuly.",
                      position: "center",
                      type: "success",
                      textStyle: { textAlign: "center" },
                    })
                  });
                });           
            }
      }


    async  onUpdateQuantity(){
        const userId= await AsyncStorage.getItem('uid');
      const updatedCart = this.state.cart;
           if(this.state.quantity > this.state.qty && !isNaN(this.state.qty)){
                    let itemIndex = updatedCart.findIndex(item => this.state.id === item.id); /* Get the index of the item we want to delete */   
                    let cartRef =  firestore().collection('cart');    
                    updatedCart[itemIndex]['qty'] = parseInt(this.state.qty);
                    this.setState({cart:updatedCart, qtymodal: false})
                    cartRef.doc(userId).set(Object.assign({}, updatedCart))
           }else if(isNaN(this.state.qty)){
             this.setState({qtymodal: false})
                 Toast.show({
                      text: "Invalid Input",
                      position: "center",
                      type: "warning",
                      textStyle: { textAlign: "center" },
                })
           }else{
             this.setState({qtymodal: false})
             Toast.show({
                      text: "Only "+this.state.quantity+" stock/s available.",
                      position: "center",
                      type: "warning",
                      textStyle: { textAlign: "center" },
                })
           }
      }

updateTextInput = (text, field) => {
  const state = this.state
  state[field] = text;
  this.setState(state);
}

      
     openModal (data){
      this.setState({
          id: data.id,
          ItemNote: data.note,
          visibleModal: true,
      })
     }

     openQtyModal (data){
      this.setState({
          id: data.id,
          qty: data.qty.toString(),
          quantity: data.quantity,
          qtymodal: true,
      })
     }

     calculateTotalPrice = () => {
    let total = 0
    this.state.cart.forEach((item) => {
      if(item.sale_price){
        if(item.addons == null){
          total += item.sale_price * item.qty
        }else{
          total += (item.sale_price * item.qty)+(item.total_addons * item.qty)
        }
        
      }else{
        if(item.addons == null){
          total += item.price * item.qty
        }else{
          total += (item.price * item.qty)+(item.total_addons * item.qty)
        }
        
      }
     
    })
  
    return total;
  }

onConfirmation(id){
    Alert.alert(
      'Delete item?',
      'Are you sure you want to delete this product from your cart?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        },
        { text: 'OK', onPress: () => this.onRemoveFromCart(id) }
      ],
      { cancelable: false }
    );
}

async onRemoveFromCart (id) {
   
      const userId= await AsyncStorage.getItem('uid');
			const { cart } = this.state;
			if(cart > 0){
			let is_existing = Object.keys(cart).length && Object.values(cart).find(item => id === item.id); /* Check if item exists in cart from state */
			if(is_existing){
				let cartRef =  firestore().collection('cart');
				
				/* Get current cart contents */
				cartRef.doc(userId).get().then(snapshot => {
					let updatedCart = Object.values(snapshot.data()); /* Clone it first */
					let itemIndex = updatedCart.findIndex(item => id === item.id); /* Get the index of the item we want to delete */
					
					/* Remove item from the cloned cart state */
					updatedCart.splice(itemIndex, 1); 

					/* Set updated cart in firebase, no need to use setState because we already have a realtime cart listener in the componentDidMount() */
					cartRef.doc(userId).set(Object.assign({}, updatedCart))
				});
			} }
      else{
        let cartRef =  firestore().collection('cart');
				
				/* Get current cart contents */
				cartRef.doc(userId).get().then(snapshot => {
					let updatedCart = Object.values(snapshot.data()); /* Clone it first */
					let itemIndex = updatedCart.findIndex(item => id === item.id); /* Get the index of the item we want to delete */
					
					/* Remove item from the cloned cart state */
					updatedCart.splice(itemIndex, 1); 

					/* Set updated cart in firebase, no need to use setState because we already have a realtime cart listener in the componentDidMount() */
					cartRef.doc(userId).set(Object.assign({}, updatedCart))
          this.setState({cart: []})
           AsyncStorage.setItem('cluster','');
				});
			}
   }
	

  render() {
     const {visible, cart} = this.state;
    
    return (
      <Root>
      <Container>
      <CustomHeader title="Cart"  Cartoff={true} navigation={this.props.navigation}/>
         <View style={{flex:1}}>
         {cart.length != 0 ?
           <ScrollView> 

             {
               this.state.cart.map((item,i)=>{
                 return(
                   <View>       
                    <TouchableOpacity style={{ justifyContent: 'flex-end',padding:10, alignItems:'flex-end'}} onPress={()=> this.openModal(item)}>
                             <Text style={{color:'salmon'}}><AntDesign name="plus" size={13} color="salmon"/>Add Note</Text>
                    </TouchableOpacity>            
                    {item.status && item.quantity > 0 && item.admin_control ?
                   <View style={{width:width,marginRight: 0,backgroundColor:'white', flexDirection:'row', borderBottomWidth:2, borderColor:"#cccccc",paddingHorizontal: 10}}>
                     <Image resizeMode={"cover"} style={{width:width/4,height:width/4, borderRadius: 15}} source={{uri: item.featured_image}} />
                     
                     <View style={{flex:1, backgroundColor:'transparent', padding:10, justifyContent:"space-between"}} >                    
                       <View>                       
                         <Text style={{fontWeight:"bold", fontSize:15}}>{item.name}</Text>
                         {item.sale_price ?
                           [item.unit && item.unit == null?
                            <Text>
                              <Text style={{textDecorationLine: 'line-through', color:'gray'}}>
                              ₱{item.price}/ {item.unit}    
                              </Text> 
                               ₱{item.sale_price}/ {item.unit}
                            </Text> 
                            :
                            <Text>
                               ₱{item.price}
                            </Text>]
                            :
                          [item.unit && item.unit == null?
                          <Text>
                            ₱{item.price} / {item.unit}
                            
                          </Text>
                          :
                          <Text>
                          ₱{item.price}
                        </Text>]
                        }
                        
                         <Text>Note :{item.note}</Text>
                       </View>
                       <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                      
                         {item.sale_price ? [item.addons == null ? <Text style={{fontWeight:'bold',color:"#33c37d",fontSize:15}}>₱{(item.sale_price*item.qty).toFixed(2)}</Text> :<Text style={{fontWeight:'bold',color:"#33c37d",fontSize:15}}>₱{((item.sale_price*item.qty)+(item.total_addons*item.qty)).toFixed(2)}</Text>] : [item.addons == null ? <Text style={{fontWeight:'bold',color:"#33c37d",fontSize:15}}>₱{(item.price*item.qty).toFixed(2)}</Text> : <Text style={{fontWeight:'bold',color:"#33c37d",fontSize:15}}>₱{((item.price*item.qty)+(item.total_addons*item.qty)).toFixed(2)}</Text>]}
                         <View style={{flexDirection:'row', alignItems:'center'}}>
                           <TouchableOpacity onPress={()=> this.openQtyModal(item)}>
                             <Icon name="ios-remove-circle" size={30} color={"#33c37d"} />
                           </TouchableOpacity>
                            <TouchableOpacity onPress={()=> this.openQtyModal(item)}>
                              <Text style={{paddingHorizontal:10, fontWeight:'bold', fontSize:15}}>{item.qty}</Text>
                           </TouchableOpacity>
                           <TouchableOpacity onPress={()=> this.openQtyModal(item)}>
                             <Icon name="ios-add-circle" size={30} color={"#33c37d"} />
                           </TouchableOpacity>
                         </View>
                          <TouchableOpacity  onPress={()=>this.onConfirmation(item.id)}>
                             <MaterialCommunityIcons name="delete-circle-outline" size={30} color={"salmon"} />
                           </TouchableOpacity>
                       </View>
                     </View>
                   </View> :
                   <View>
                   <View style={{width:width,marginRight: 0,backgroundColor:'white', flexDirection:'row', borderBottomWidth:2, borderColor:"#cccccc", paddingVertical:10,paddingHorizontal: 10}}>
                     <Image resizeMode={"cover"} style={{width:width/4,height:width/4, borderRadius: 15}} source={{uri: item.featured_image}} />
                     
                     <View style={{flex:1, backgroundColor:'transparent', padding:10, justifyContent:"space-between"}} >                    
                       <View>                       
                         <Text style={{fontWeight:"bold", fontSize:15}}>{item.name}</Text>
                         {item.sale_price ?
                          <Text><Text style={{textDecorationLine: 'line-through'}}>₱{item.price}</Text> ₱{item.sale_price}/ {item.unit}</Text> : <Text>₱{item.price} / {item.unit}</Text>}
                         
                         <Text>Note :{item.note}</Text>
                       </View>
                       <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                         {item.sale_price ? <Text style={{fontWeight:'bold',color:"#33c37d",fontSize:15}}>₱{(item.sale_price*item.qty).toFixed(2)}</Text> : <Text style={{fontWeight:'bold',color:"#33c37d",fontSize:15}}>₱{(item.price*item.qty).toFixed(2)}</Text>}
                         <View style={{flexDirection:'row', alignItems:'center'}}>
                           <TouchableOpacity onPress={()=>this.onDecrementQuan(item)}>
                             <Icon name="ios-remove-circle" size={30} color={"#33c37d"} />
                           </TouchableOpacity>
                           <TouchableOpacity onPress={()=> alert('test')}>
                              <Text style={{paddingHorizontal:10, fontWeight:'bold', fontSize:15}}>{item.qty}</Text>
                           </TouchableOpacity>
                           <TouchableOpacity onPress={()=>this.onIncrementQuan(item)}>
                             <Icon name="ios-add-circle" size={30} color={"#33c37d"} />
                           </TouchableOpacity>
                           
                         </View>
                       </View>
                     </View>
                   </View>
                    <TouchableOpacity style={styles.overlay} onPress={()=>this.onConfirmation(item.id)}>
                      <View style={{justifyContent: 'center', content:'center'}} >
                        <Text style={{textAlign: 'center', color: 'white',fontWeight:'bold', elevation: 3, fontSize:20}}>Unavailable</Text>
                      </View>                   
                      <Text style={{color:'white', fontSize: 15}}>Tap to remove</Text>                  
                    </TouchableOpacity>
                    </View>  
                      }
                   </View>
                 )
               })
             }
           </ScrollView> : 
           <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
           <View>
             <Image source={require('../assets/basket.png')} 
          style={{alignSelf:'center', justifyContent:'center'}}
          />
            <Text style={{alignSelf:'center', justifyContent:'center'}}>Cart is empty..</Text>
           </View>
           </ScrollView>
            }

          <View style={{backgroundColor: '#fff', borderTopWidth: 2, borderColor: '#f6f6f6', paddingVertical: 5}}>
					
          <View style={{flexDirection: 'row'}}>
            
            <View style={{flexDirection: 'row', flexGrow: 1, flexShrink: 1, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10}}>
              <View style={{flexDirection: 'row', paddingRight: 20, alignItems: 'center', paddingLeft: 20}}>
                <Text style={{color: '#8f8f8f', paddingRight: 30, fontSize: 20}}>SubTotal: </Text>
               
                    <NumberFormat  renderText={text => <Text style={{ paddingLeft: (width / 2)- 60, fontWeight: 'bold'}}>{text}</Text>} value={Math.round(this.calculateTotalPrice()*10)/10} displayType={'text'} thousandSeparator={true} prefix={'₱'} />
              </View>
            </View>
          </View>
          <View style={{ height: 40, alignItems: 'center'}}>
          {cart.length != 0 ?
            <TouchableOpacity style={[styles.centerElement, {backgroundColor: 'salmon', width: width - 10, height: 40, borderRadius: 5, padding: 10}]} onPress={()=> this.checkAvailability()}>
              <Text style={{color: '#ffffff'}}>Checkout</Text>
            </TouchableOpacity> : <TouchableOpacity style={[styles.centerElement, {backgroundColor: 'gray', width: width - 10, height: 40, borderRadius: 5, padding: 10}]}>
              <Text style={{color: '#ffffff'}}>Checkout</Text>
            </TouchableOpacity>}
          </View>
        </View>
         </View>
         <Modal
            isVisible={this.state.visibleModal}
            animationInTiming={1000}
            animationIn='slideInUp'
            animationOut='slideOutDown'
            animationOutTiming={1000}
            useNativeDriver={true}
            onBackdropPress={() => this.setState({visibleModal: false})} transparent={true}>
           <View style={style.content}> 
          
                    <View style={{margin: 10}}>
                    <Form>
                           <Textarea rowSpan={5} value={this.state.ItemNote} bordered placeholder="Your Note Here" onChangeText={(text) => this.setState({ItemNote: text})}/>
                    </Form>
                    </View>
              
           <Button block style={{ height: 30, backgroundColor: "#33c37d"}}
              onPress={() =>this.onUpdateNote()}
            >
             <Text style={{color: 'white'}}>DONE</Text>
            </Button>
            
            <Button block style={{ height: 30, backgroundColor:  "#33c37d", marginTop: 10}}
              onPress={() => this.setState({visibleModal: false})}
            >
             <Text style={{color:'white'}}>CANCEL</Text>
            </Button>
          </View>
          </Modal>
          <Modal
            isVisible={this.state.qtymodal}
            animationInTiming={1000}
            animationIn='slideInUp'
            animationOut='slideOutDown'
            animationOutTiming={1000}
            useNativeDriver={true}
            onBackdropPress={() => this.setState({qtymodal: false})} transparent={true}>
           <View style={style.content}> 
               <Text style={{textAlign: 'center'}}>Change Quantity</Text>
                    <View style={{margin: 10}}>
                    
                    <Text style={{ fontSize: 10}}>Quantity</Text>
                    <Item regular style={{marginTop: 7}}>
                        <Input  value={this.state.qty} keyboardType='numeric' onChangeText={(text) => this.updateTextInput(text, 'qty')} placeholderTextColor="#687373" />
                    </Item>
                    </View>
              
           <Button block style={{ height: 30, backgroundColor: "#33c37d"}}
              onPress={() =>this.onUpdateQuantity()}
            >
             <Text style={{color: 'white'}}>SAVE</Text>
            </Button>
            
            <Button block style={{ height: 30, backgroundColor:  "#33c37d", marginTop: 10}}
              onPress={() => this.setState({qtymodal: false})}
            >
             <Text style={{color:'white'}}>CANCEL</Text>
            </Button>
          </View>
          </Modal>
      </Container>
      </Root>
    );
  }

  onChangeQuan(i,type)
  {
    const dataCar = this.state.dataCart
    let cantd = dataCar[i].quality;

    if (type) {
     cantd = cantd + 1
     dataCar[i].quality = cantd
     this.setState({dataCart:dataCar})
    }
    else if (type==false&&cantd>=2){
     cantd = cantd - 1
     dataCar[i].quality = cantd
     this.setState({dataCart:dataCar})
    }
    else if (type==false&&cantd==1){
     dataCar.splice(i,1)
     this.setState({dataCart:dataCar})
    }
  }
}

const style = StyleSheet.create({
  wrapper: {
    // marginBottom: -80,
    backgroundColor: "white",
    height: 80,
    width: "100%",
    padding: 10
  },
  notificationContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start"
  },
 sssage: {
    marginBottom: 2,
    fontSize: 14
  },
  closeButton: {
    position: "absolute",
    right: 10,
    top: 10
  },
  content: {
    backgroundColor: 'white',
    padding: 22,
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
});


const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1,
    },
    standaloneRowFront: {
        alignItems: 'center',
        backgroundColor: '#CCC',
        justifyContent: 'center',
        height: 50,
    },
    standaloneRowBack: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#CCC',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    backTextWhite: {
        color: '#FFF',
    },
    spacer: {
        height: 50,
    },
    centerElement: {justifyContent: 'center', alignItems: 'center'},
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
    fontSize: 32
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
    backgroundColor: 'rgba(30, 42, 54, 0.4)',
    flex: 1, 
    justifyContent: 'center',
    alignItems:'center'
  },
});
