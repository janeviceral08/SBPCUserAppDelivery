import React, { Component } from "react";
import {StyleSheet, FlatList, TouchableOpacity,BackHandler, Alert, ScrollView} from 'react-native';
import { Container, Header, Icon, Accordion, Text, View, Card, CardItem, Thumbnail, Body, Left, Right, Button,List,ListItem } from "native-base";
import Ionicons from 'react-native-vector-icons/Ionicons'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from "../../components/Loader";
import CustomHeader from '../Header';

export default class Pending extends Component {
  constructor(props) {
    super(props);
    this.unsubscribe = null;
    this.state = {
      user: null,
      email: "",
      password: "",
      formValid: true,
      error: "",
      loading: false,
      
    };
     }
    
     
  render() {
    console.log('datas: ', this.props.orders)
    return (
      <Container style={{flex: 1}}> 
        <Loader loading={this.state.loading}/>
        <ScrollView>
        {this.props.uid ? 
  
        <FlatList
               data={this.props.orders}
               renderItem={({ item }) => (
                <View>
                   {item.datas.OrderStatus == 'Pending' ?
                   <Card>
                        <CardItem button onPress={() => this.props.navigation.navigate('OrderDetails',{ 'orders' : item.datas })}>            
                        <Body style={{paddingLeft: 10, flex:3}}>
                            <Text style={{fontSize: 14,fontWeight: '900'}}>Order Number: #00{item.datas.OrderNo} {item.datas.OrderId}</Text>
                            <Text note style={{color:'black', fontSize: 12}}>{item.datas.OrderDetails.Date_Ordered}</Text>
                        </Body>
                        <Right>
                          <Text style={{color: "salmon", fontStyle:"italic"}}>View</Text>
                        </Right>
                      </CardItem> 
                    </Card>: null }
                </View>

               )}
               
           /> : 
                <View style={styles.container}>      
                  <Text style={{paddingVertical: 10}}>No orders yet</Text>
                </View>
           }
        </ScrollView>
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