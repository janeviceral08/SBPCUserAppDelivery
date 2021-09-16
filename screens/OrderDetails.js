import React, { Component } from "react";
import {StyleSheet, FlatList, ScrollView} from 'react-native';
import { Container, Header, Icon, Accordion, Text, View, Card, CardItem, Thumbnail, Body, Left, Right, Button,Toast,List,ListItem } from "native-base";
import StepIndicator from 'react-native-step-indicator'
import CustomHeader from './Header';

const secondIndicatorStyles = {
  stepIndicatorSize: 30,
  currentStepIndicatorSize: 40,
  separatorStrokeWidth: 2,
  currentStepStrokeWidth: 3,
  stepStrokeCurrentColor: '#fe7013',
  stepStrokeWidth: 3,
  separatorStrokeFinishedWidth: 4,
  stepStrokeFinishedColor: '#fe7013',
  stepStrokeUnFinishedColor: '#aaaaaa',
  separatorFinishedColor: '#fe7013',
  separatorUnFinishedColor: '#aaaaaa',
  stepIndicatorFinishedColor: '#fe7013',
  stepIndicatorUnFinishedColor: '#ffffff',
  stepIndicatorCurrentColor: '#ffffff',
  stepIndicatorLabelFontSize: 13,
  currentStepIndicatorLabelFontSize: 13,
  stepIndicatorLabelCurrentColor: '#fe7013',
  stepIndicatorLabelFinishedColor: '#ffffff',
  stepIndicatorLabelUnFinishedColor: '#aaaaaa',
  labelColor: '#999999',
  labelSize: 13,
  currentStepLabelColor: '#fe7013'
}




export default class OrderDetails extends Component {
  constructor(props) {
    super(props);
    const orders = this.props.route.params.orders;
    const cartItems = [];
    const cart = cartItems.concat(orders.Stores)
    this.state = {
      user: null,
      email: "",
      password: "",
      formValid: true,
      error: "",
      loading: false,
      dataSource: orders.Products,
      labor:'',
      pickup:'',
      delivery: orders.delivery_charge,
      subtotal: orders.subtotal,
      total:'',
      extra: orders.extraKmCharge,
      status: '',
      products: [],
      OrderStatus: orders.OrderStatus,
    currentPosition:0,
      paymentmethod: orders.PaymentMethod,
    discount: orders.discount,
    isCancelled: orders.isCancelled,
    id : orders.OrderId   };
   

  }



  componentDidMount() {
  
     if(this.state.OrderStatus == 'Pending'){
        this.setState({currentPosition: 0})
      }
    else if(this.state.OrderStatus == 'Processing'){
      this.setState({currentPosition: 1})
    }
    else if (this.state.OrderStatus == 'On the way'){
    this.setState({currentPosition: 2})
  }else if (this.state.OrderStatus == 'Delivered'){
    this.setState({currentPosition: 3})
  }
}

 storeTotal (){
   const {dataSource} = this.state;
  let total =0;
  let addonTotal = 0;
   dataSource.forEach(item=>{

        if(item.sale_price){
          total += item.sale_price * item.qty
        }else{
          total += item.price * item.qty
        }

        if(item.choice){
          item.choice.forEach(addon => {
              addonTotal += addon.price * item.qty
          });
      }
      
   });
   return total + addonTotal;
 }

  render() {
    return (
      <Container>
      <CustomHeader title="Order Details" Cartoff={true} navigation={this.props.navigation}/>
        <ScrollView style={{ backgroundColor: "white" }}>
        
        <View style={styles.container}>
        <View style={styles.stepIndicator}>
          <StepIndicator  
            stepCount={4}   
            customStyles={secondIndicatorStyles}
            currentPosition={this.state.currentPosition}
            labels={[    
                'Pending',        
              'Processing',
              'On the way',
              'Delivered'
            ]}
          />
        </View>
        <FlatList
               data={this.state.dataSource}
               renderItem={({ item }) => (            
            <Card transparent>
              {item.sale_price ?  <CardItem>
                  <Thumbnail square style={{width: 30, height: 30}} source={{ uri: item.featured_image }} />
                <Body style={{paddingLeft: 5}}>
                  <Text style={{fontSize: 10, fontWeight: 'bold'}}>
                    {item.qty > 1 ? item.qty+" x " : null}
                    {item.name}
                  </Text>
                  <Text note style={{fontSize: 10}}>Brand: {item.brand}</Text>
                  <Text note style={{fontSize: 10}}>by {item.store_name}</Text>
                </Body>
                <Right style={{textAlign: 'right'}}>
                  <Text style={{fontSize: 10, fontWeight: 'bold', marginBottom: 10}}>₱{Math.round((item.sale_price * item.qty)*10)/10}</Text>
                </Right>
                </CardItem>: 
                  <CardItem>
                  <Thumbnail square style={{width: 30, height: 30}} source={{ uri: item.featured_image }} />
                <Body style={{paddingLeft: 5}}>
                  <Text style={{fontSize: 10, fontWeight: 'bold'}}>
                    {item.qty > 1 ? item.qty+" x " : null}
                    {item.name}
                  </Text>
                  <Text note style={{fontSize: 10}}>Brand: {item.brand}</Text>
                  <Text note style={{fontSize: 10}}>by {item.store_name}</Text>
                </Body>
                <Right style={{textAlign: 'right'}}>
                  <Text style={{fontSize: 10, fontWeight: 'bold', marginBottom: 10}}>₱{Math.round((item.price * item.qty)*10)/10}</Text>
                </Right>
              </CardItem>
                
                }
                 {item.choice  ? 
              [item.choice.map((drink, i) =>
                <View key={i}>
                   <List style={{marginLeft: 20}}>
                   <ListItem>
                      <Left  style={{justifyContent: "flex-start"}}>
                          <Text style={{fontWeight:'bold', fontSize: 20}}>{'\u2022' + " "}</Text>
                      </Left>
                      <Body style={{justifyContent: "flex-start", flex: 5, flexDirection: "row"}}>
                          <Text style={{ fontSize: 10}}>{item.qty}x </Text>
                          <Text style={{ fontSize: 10}}>{drink.label}</Text>
                      </Body>
                      <Right style={{justifyContent: "flex-end", flex:1}}>
                          <Text style={{ fontSize: 10, fontWeight:'bold' }}>₱{drink.price*item.qty}</Text>
                      </Right>                                                   
                   </ListItem>
               </List>
               </View>
              )] : null}
            </Card>
           )}
           
       />
        <CardItem>
            <Body>
              <Text style={{fontSize: 13, color: 'gray'}}>Sub total</Text>
            </Body>
            <Right>
              <Text style={{fontSize: 13}}>
              ₱{Math.round(this.storeTotal()*10)/10}
              </Text>
            </Right>
          </CardItem>
          <CardItem>
            <Body>
              <Text style={{fontSize: 13, color: 'gray'}}>Delivery Charge</Text>
            </Body>
            <Right>
              <Text style={{fontSize: 13}}>
              ₱{Math.round(this.state.delivery*10)/10}
              </Text>
            </Right>
          </CardItem>       
          <CardItem>
            <Body>
              <Text style={{fontSize: 13, color: 'gray'}}>Extra Kilometer Charge</Text>
            </Body>
            <Right>
              <Text style={{fontSize: 13}}>
              ₱{this.state.extra}
              </Text>
            </Right>
          </CardItem>
          <CardItem>
            <Body>
              <Text style={{fontSize: 13, color: 'tomato'}}>Discount</Text>
            </Body>
            <Right>
              <Text style={{fontSize: 13, color:'tomato'}}>
             - ₱{this.state.discount}
              </Text>
            </Right>
          </CardItem>
          <View style={{borderTopColor: 'black', borderTopWidth: 2,borderStyle: 'dashed',  borderRadius: 1}}/>
          <CardItem>
            <Left>
               <Text style={{color:'orange'}}>{this.state.paymentmethod}</Text>
            </Left>
            <Right>
               <Text>₱{Math.round((this.state.extra + this.storeTotal() + this.state.delivery - this.state.discount)*10)/10}</Text>
            </Right>
          </CardItem>
     </View>     
        </ScrollView>
      </Container>
    );
  }
}


const styles = StyleSheet.create({
      stepIndicator: {
      marginVertical: 10
    },
    
    })