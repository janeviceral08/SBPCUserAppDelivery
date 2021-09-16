
import React, { Component } from 'react';
import { Content, Right, Card, CardItem, Body,Item, Input,Text, Textarea, Form } from 'native-base';
import {TouchableOpacity, View, Picker} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Our custom files and classes import

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default class DeliveryDetails extends Component {
  constructor(props) {
      super(props);
      this.barangayRef =  firestore().collection('barangay');
      this.cityRef =  firestore().collection('city');
      this.subscribe=null;
      this.tosubscribe = null;
      this.state = {
       barangay:[],
       edit: true,
       name: '',
       phone: '',
       email: '',
       street: '',
       PickerValueHolder: '',
       zipcode: '',
       country: '',
       province: '',
       street: '',
       landmark: '',
       othernote:'',
       cityList: [],
       barangayList: [],
       selectedCity:'',
       SelectedBarangay:''
      };
      this.getAddress();

  }


  getAddress = () => {
    const userId =  auth().currentUser.uid;
    const ref =  firestore().collection('users').doc(userId);
    ref.get().then((doc) => {
      if (doc.exists) {
        const data = doc.data();
        this.setState({
          key: doc.id,
          name: data.Shipping_Address.Receiver_Name,
          email: data.Shipping_Address.Receiver_Email,
          phone: data.Shipping_Address.Receiver_Mobile,
          address: data.Shipping_Address.Address,
          selectedCity: data.Shipping_Address.City,
          barangay: data.Shipping_Address.Barangay,
          SelectedBarangay: data.Shipping_Address.Barangay,
          country: data.Shipping_Address.Country,
          province: data.Shipping_Address.Province,
          othernote: data.Shipping_Address.Note,
          landmark: data.Shipping_Address.Landmark,
          isLoading: false
        });
        this.fetchBarangay(data.Address.City)
        
      } 
    });
  }
  
  fetchBarangay =(city)=>{
    this.setState({ selectedCity: city })
    this.tosubscribe = this.barangayRef.where('city', '==', city).onSnapshot(this.onBarangayUpdate);
  }

  onCityUpdate = (querySnapshot) => {
    const city = [];
   querySnapshot.forEach((doc) => {
    city.push ({
           datas : doc.data(),
           key : doc.id
           });        
   });
   this.setState({
     cityList: city,
  });
  
  }

  onBarangayUpdate = (querySnapshot) => {
    const barangay = [];
   querySnapshot.forEach((doc) => {
    barangay.push ({
           datas : doc.data(),
           key : doc.id
           });        
   });
   this.setState({
     barangayList: barangay,
  });
  
  }

  async updatUserAddress() {
    this.setState({edit: true})
    const userId= await AsyncStorage.getItem('uid');
    const updateRef =  firestore().collection('users').doc(userId);
    updateRef.update({
     Shipping_Address: {
      Receiver_Name  : this.state.name,
      Receiver_Email  : this.state.email,
      Receiver_Mobile  : this.state.phone,
      Address  : this.state.address,
      City  : this.state.selectedCity,
      Barangay  : this.state.SelectedBarangay,
      Country: this.state.country,
      Province: this.state.province,
      Note: this.state.othernote,
      Landmark : this.state.landmark
     }
    })
    this.getAddress();
}

componentDidMount(){
  this.subscribe = this.cityRef.onSnapshot(this.onCityUpdate)
}

  componentWillUnmount() {
    this.tosubscribe && this.tosubscribe();
   
  }
  


  render() {
    
    return(            
            <Content >
               <Card  elevation={5} style={{borderColor: '#ddd', padding: 5, flex:1}}>
                    <CardItem header>    
                        <Text style={{fontSize: 18,fontWeight:'bold', color: 'tomato'}}>Delivery Details</Text>    
                        <Body />
                        <Right style={{flexDirection: 'row', justifyContent:'flex-end'}}>
                            <TouchableOpacity style={{ paddingRight: 5}} onPress={()=> this.setState({edit: false})}>
                                <Text style={{color:'red'}}>EDIT</Text>
                            </TouchableOpacity>
                            { this.state.edit == false && 
                                <TouchableOpacity style={{ paddingLeft: 10}} onPress={()=>this.updatUserAddress()}>
                                <Text style={{color:'green'}}>SAVE</Text>
                            </TouchableOpacity>
                            }
                        </Right>
                    </CardItem>
                   <Item regular style={{marginTop: 5, paddingLeft:10,height:40}}>
                        <Text style={{color:'#ccc'}}>Recipient:</Text>
                        <Input style={{fontSize: 15}} placeholder='Name' onChangeText={(text) => this.setState({name: text})} placeholderTextColor="#687373" value={this.state.name}  disabled={this.state.edit}/>
                   </Item>
                    <Item regular style={{marginTop: 5, paddingLeft:10,height:40}}>
                        <Text style={{color:'#ccc'}}>Mobile #:</Text>
                        <Input
                            onChangeText={(text) => this.setState({phone: text})}           
                            value={this.state.phone}
                            disabled={this.state.edit}
                        />
                    </Item>
                    <Text style={{marginTop: 15, fontSize: 10}}>Street / Street No.</Text>
                 <View>
                    <Form>
                        <Textarea rowSpan={3} value={this.state.address} bordered  placeholder="Street Name, Streeet Number" onChangeText={(text) => this.setState({address: text})} disabled={this.state.edit}/>
                    </Form>
                </View>
                <Text style={{marginTop: 15, fontSize: 10}}>Barangay/Municipality</Text>
            <View style={{borderWidth: 0.5, marginTop: 5, borderColor: '#ccc'}}>
                    <Picker
                        selectedValue={this.state.SelectedBarangay}
                        enabled={!this.state.edit}
                        onValueChange={(itemValue, itemIndex) => this.setState({SelectedBarangay: itemValue})} >
                        <Picker.Item label = {this.state.SelectedBarangay} value={this.state.SelectedBarangay}/>
                        { this.state.barangayList.map((item, key)=>(
                        <Picker.Item label={item.datas.barangay} value={item.datas.barangay} key={key} />)
                        )}              
                    </Picker>
                </View>
                <Item regular style={{marginTop: 5, paddingLeft:10,height:40}}>
            <Text style={{color:'#ccc'}}>Landmark/s:</Text>
                <Input placeholder='Eg. Near Plaza (optional)'  onChangeText={(text) => this.setState({landmark: text})} placeholderTextColor="#687373"  value={this.state.landmark}  disabled={this.state.edit}/>
            </Item>
         
            <Item regular style={{marginTop: 5, paddingLeft:10,height:40}}>
            <Text style={{color:'#ccc'}}>City:</Text>
              <Input
                  onChangeText={(text) => this.setState({selectedCity: text})}
                  value={this.state.selectedCity}
            
                  disabled={this.state.edit}
                />

            </Item>
                 <Item regular style={{marginTop: 5, paddingLeft:10,height:40}}>
            <Text style={{color:'#ccc'}}>Province:</Text>
              <Input
                  onChangeText={(text) => this.setState({province: text})}
                  value={this.state.province}
            
                  disabled={this.state.edit}
                />

            </Item>
            <Item regular style={{marginTop: 5, paddingLeft:10,height:40}}>
            <Text style={{color:'#ccc'}}>Country:</Text>
              <Input
                  onChangeText={(text) => this.setState({country: text})}
                  value={this.state.country}         
                  disabled={this.state.edit}
                />
            </Item>
          
            <View >
                <Form>
                       <Textarea rowSpan={3} value={this.state.othernote} bordered  placeholder="Note to Rider" onChangeText={(text) => this.setState({othernote: text})} disabled={this.state.edit}/>
                </Form>
                </View>
                </Card> 
            </Content>   
    );
  }

}
