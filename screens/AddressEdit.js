import React, { Component } from 'react';
import { StyleSheet, Text, View,Image, FlatList , ScrollView,TouchableOpacity, Alert} from 'react-native';
import {Card, CardItem, Thumbnail, Body, Left, Header, Right, Title,Input, Item, Button, Icon, Picker, Toast, Container, Root} from 'native-base';
import ConfettiCannon from 'react-native-confetti-cannon';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import { ToggleButton } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'

export default class Address extends Component {
constructor(props) {
            super(props);
            this.cityRef =  firestore().collection('city');
            this.barangayRef =  firestore();
            this.ref =  firestore();
            this.subscribe= null;
            this.state = {
              email: '',
              name: '',
              username: '',
              password: '',
              rePassword: '',
              mobile:'',
              hasError: false,
              errorText: '',
              loading: false,
              barangay: [],
              address:'',
              postal:'',
              city:'',
              province:'',
              PickerValueHolder: 'Select Barangay',
              barangayList: [],
              cityList:[],
              userTypes: [{userType: 'admin', userName: 'Admin User'}, {userType: 'employee', userName: 'Employee User'}, {userType: 'dev', userName: 'Developer User'}],
              selectedCity: 'Select City/Municipality',
              selectedBarangay: 'Select Barangay',
              address_list:[],
              Edit: false,
              isDefault: false,
              id: '',
              visibleEditModal:false
            };
        }



  async component (){
    let userId= await AsyncStorage.getItem('uid');
 	/* Listen to realtime cart changes */
     this.unsubscribeCartItems =  firestore().collection('users').doc(userId).onSnapshot(snapshotCart => {
        if(snapshotCart.data()){
            this.setState({address_list: Object.values(snapshotCart.data().Shipping_Address)});
   
        } else {
            this.setState({address_list: [], loading: false});
        }
    });
  }

  componentDidMount() {
  
   this.component();
   this.tosubscribe = this.cityRef.onSnapshot(this.onCityUpdate);
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

updateTextInput = (text, field) => {
  const state = this.state
  state[field] = text;
  this.setState(state);
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

  fetchBarangay =(city)=>{
    this.setState({ selectedCity: city })
    this.subscribe = this.barangayRef.collection('barangay').where('city', '==', city).onSnapshot(this.onBarangayUpdate)
  }

 async onEditSave(){
    const userId= await AsyncStorage.getItem('uid');
    let addressRef =  firestore().collection('users');
                
    /* Get current cart contents */
    addressRef.doc(userId).get().then(snapshot => {
      let updatedCart = Object.values(snapshot.data().Shipping_Address); /* Clone it first */
      console.log(updatedCart)
      let itemIndex = updatedCart.findIndex(item => this.state.id === item.id); /* Get the index of the item we want to delete */
      
      /* Set item quantity */
      updatedCart[itemIndex]['postal'] = this.state.postal;
      updatedCart[itemIndex]['address'] = this.state.address; 
      updatedCart[itemIndex]['city'] = this.state.selectedCity; 
      updatedCart[itemIndex]['barangay'] = this.state.selectedBarangay; 
      updatedCart[itemIndex]['province'] = this.state.province; 
      updatedCart[itemIndex]['phone'] = this.state.mobile; 
      updatedCart[itemIndex]['name'] = this.state.name;  
      
      /* Set updated cart in firebase, no need to use setState because we already have a realtime cart listener in the componentDidMount() */
      addressRef.doc(userId).update({Shipping_Address:  updatedCart}).then(() => {
        this.setState({
          postal: '',
          address:'',
          selectedCity: '',
          selectedBarangay: '',
          province: '',
          mobile: '',
          name: '',
          id: '',
          visibleEditModal: false
        })
      
        Toast.show({
          text: "Address updated succesfuly.",
          position: "center",
          type: "success",
          textStyle: { textAlign: "center" },
        })
      });
    }); 
  }

  editAddress(item){
    this.setState({
      postal: item.postal,
      address:item.address,
      selectedCity: item.city,
      selectedBarangay: item.barangay,
      province: item.province,
      mobile: item.phone,
      name: item.name,
      id: item.id,
      visibleEditModal: true
    })
    this.fetchBarangay(item.city)
  }

  ondeleteConfirm(item){
    Alert.alert(
      'Delete address?',
      'Are you sure you want to delete your billing address?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        },
        { text: 'OK', onPress: () => this.ondeleteAddress(item) }
      ],
      { cancelable: false }
    );
  }

  async ondeleteAddress(data){
    let userId= await AsyncStorage.getItem('uid');
    let addressRef =  firestore().collection('users');
				
    /* Get current cart contents */
    if(!data.default){
      addressRef.doc(userId).get().then(snapshot => {
        let updatedCart = Object.values(snapshot.data().Shipping_Address); /* Clone it first */
        let itemIndex = updatedCart.findIndex(item => data.id === item.id); /* Get the index of the item we want to delete */
        
        /* Remove item from the cloned cart state */
        updatedCart.splice(itemIndex, 1); 
  
        /* Set updated cart in firebase, no need to use setState because we already have a realtime cart listener in the componentDidMount() */
        addressRef.doc(userId).update({Shipping_Address: updatedCart})
    })
    }else{
      Alert.alert(
        'Note',
        'Default address cannot be deleted.',
        [
          { text: 'OK', onPress: () => console.log('ok Pressed') }
        ],
        { cancelable: false }
      );
    }
    
}
  
 async onCreateAddress() {
   const {address_list} = this.state;
            let userId= await AsyncStorage.getItem('uid');
            const newDocumentID =  firestore().collection('users').doc().id;
            let newItem = {
                id: newDocumentID,
                name: this.state.name,
                phone: this.state.mobile,
                province: this.state.province,
                city: this.state.selectedCity,
                barangay: this.state.selectedBarangay,
                postal: this.state.postal,
                address: this.state.address
            };
            let updatedCart = Object.values(address_list); /* Clone it first */
            let ref =  firestore().collection('users').doc(userId);

            
            /* Push new cart item */
            updatedCart.push(newItem); 
            
            /* Set updated cart in firebase, no need to use setState because we already have a realtime cart listener in the componentDidMount() */
            ref.update({
              Shipping_Address: Object.assign({}, updatedCart)
              }).then(() => {
                this.setState({visibleModal:false})
              Toast.show({
                  text: "Added new address",
                  position: "top",
                  type: "success",
                  textStyle: { textAlign: "center" },
                })
            });
    }


 
  render() {
    return (
      <Root>
      <Container style={styles.Container}>
                <Header androidStatusBarColor="#2c3e50" style={{display:'none'}} style={{backgroundColor: 'salmon'}}>
                <Left> 
                  <Button transparent onPress={()=> this.props.navigation.goBack()}>
                  <MaterialIcons name="arrow-back" size={25} color="white" />
                 </Button> 
                </Left>
                <Body style={{justifyContent: "center", alignContent: "center"}}>
                    <Title style={{color: 'white'}}>My Address</Title>
                </Body>
                <Right>
                  <TouchableOpacity onPress={()=> this.setState({visibleModal: true})}>
                      <Text style={{color:'white'}}>Add Address</Text>
                  </TouchableOpacity>
                </Right>
                </Header>
                <FlatList
                    data={this.state.address_list}
                    renderItem={({ item }) => 
                    <Card transparent>
                    <CardItem style={{borderRadius: 5, borderWidth: 0.1, marginHorizontal: 10}}>                     
                      <Body style={{flex: 3, flexDirection: 'column'}}>
    <Text style={{fontSize: 13}}>{item.name} | {item.phone} {"\n"}{item.address}, {item.barangay}, {item.city}, {item.province}, {item.postal}</Text>
                        <View style={{flexDirection: 'row'}}>
                          <Left style={{paddingLeft:20, paddingTop: 10}}>
                            <TouchableOpacity onPress={()=> this.editAddress(item)} style={{backgroundColor:'salmon', paddingHorizontal: 10, paddingVertical: 5}}>
                              <Text style={{color: 'white', fontSize: 15, fontStyle:'italic'}}>Edit</Text>
                            </TouchableOpacity>
                          </Left>
                          <Right style={{paddingRight:20, paddingTop: 10}}>
                            <TouchableOpacity onPress={()=> this.ondeleteConfirm(item)} style={{backgroundColor:'salmon', paddingHorizontal: 10, paddingVertical: 5}}>
                              <Text  style={{color: 'white', fontSize: 15, fontStyle:'italic'}}>Delete</Text>
                            </TouchableOpacity>
                          </Right>
                        </View>
                      </Body>                   
                    </CardItem>
                  </Card>  
                    }
                    keyExtractor={item => item.key}
                />
                  
            <Modal
            useNativeDriver={true}
            isVisible={this.state.visibleModal}
            onSwipeComplete={this.close}
            swipeDirection={['up', 'left', 'right', 'down']}
            style={styles.view}
            onBackdropPress={() => this.setState({visibleModal: false})} transparent={true}>
           <View style={styles.content}> 
              <View>
                <ScrollView keyboardShouldPersistTaps="always">
                   <View style={{flexDirection: 'row', justifyContent:'space-between'}}>
                  <Text style={{marginTop: 15, fontSize: 18}}>Create new address</Text>
                  <TouchableOpacity onPress={()=> this.setState({visibleModal: false,mobile:'',
                                                                                      name:'',
                                                                                      address:'',
                                                                                      postal:'',
                                                                                      city:'',
                                                                                      province:'',
                                                                                      selectedCity: 'Select City/Municipality',
                                                                                      selectedBarangay: 'Select Barangay',})}>
                      <AntDesign name="closecircleo" size={20} color="#687373" style={{marginTop: 5,alignContent: 'flex-end'}}/>
                     
                   </TouchableOpacity>
                   </View>
                  <Text style={{marginTop: 15, fontSize: 10}}>Full Name</Text>
                  <Item regular style={{marginTop: 7}}>
                      <Input placeholder={this.state.name} value={this.state.name}  onChangeText={(text) => this.updateTextInput(text, 'name')} placeholderTextColor="#687373" />
                  </Item>
                  <Text style={{marginTop: 15, fontSize: 10}}>Phone Number</Text>
                  <Item regular style={{marginTop: 7}}>
                      <Input placeholder={this.state.mobile} value={this.state.mobile} keyboardType='numeric'  onChangeText={(text) => this.updateTextInput(text, 'mobile')} placeholderTextColor="#687373" />
                  </Item>
                  <Text style={{marginTop: 15, fontSize: 10}}>Province</Text>
                  <Item regular style={{marginTop: 7}}>
                      <Input placeholder={this.state.province} value={this.state.province}   onChangeText={(text) => this.updateTextInput(text, 'province')} placeholderTextColor="#687373" />
                  </Item>
                  <Text style={{marginTop: 15, fontSize: 10}}>City</Text>
                  <Item>
             
                    <Picker
                         selectedValue={this.state.selectedCity}
                         onValueChange={(itemValue, itemIndex) => 
                               this.fetchBarangay(itemValue)                        
                             }>     
                            <Picker.Item label = {this.state.selectedCity}  value={this.state.selectedCity}  />
                                                        {this.state.cityList.map(user => (
                              <Picker.Item label={user.datas.label} value={user.datas.label} />
                            ))        }
                    </Picker>
                  </Item>
                        
                   <Text style={{marginTop: 15, fontSize: 10}}>Barangay</Text>
                   {this.state.selectedCity != 'Select City/Municipality' ?
            
                  <Item>
                    
                            <Picker
                                selectedValue={this.state.selectedBarangay}
                                onValueChange={(itemValue, itemIndex) => 
                                    this.setState({selectedBarangay: itemValue})
                                    }>     
                                    <Picker.Item label = {this.state.selectedBarangay}  value={this.state.selectedBarangay}  />
                                                      {this.state.barangayList.map(user => (
                            <Picker.Item label={user.datas.barangay} value={user.datas.barangay} />
                          ))        }
                            </Picker>
                
                    </Item> : null}
                  <Text style={{marginTop: 15, fontSize: 10}}>Postal Address</Text>
                  <Item regular style={{marginTop: 7}}>
                      <Input placeholder={this.state.postal} value={this.state.postal}   onChangeText={(text) => this.updateTextInput(text, 'postal')} placeholderTextColor="#687373" />
                  </Item>
                  <Text style={{marginTop: 15, fontSize: 10}}>Detailed Address</Text>
                  <Item regular style={{marginTop: 7}}>
                      <Input placeholder={this.state.address} value={this.state.address}   onChangeText={(text) => this.updateTextInput(text, 'address')} placeholderTextColor="#687373" />
                  </Item>
                  
                  <Button block style={{ height: 30, backgroundColor:  "salmon", marginTop: 10}}
                    onPress={() => this.onCreateAddress()}
                  >
                  <Text style={{color:'white'}}>SAVE</Text>
                  </Button>
                  </ScrollView>
              </View>
          </View>
          </Modal>
          <Modal
            useNativeDriver={true}
            isVisible={this.state.visibleEditModal}
            onSwipeComplete={this.close}
            swipeDirection={['up', 'left', 'right', 'down']}
            style={styles.view}
            onBackdropPress={() => this.setState({visibleEditModal: false})} transparent={true}>
           <View style={styles.content}> 
              <View>
                <ScrollView keyboardShouldPersistTaps="always">
                   <View style={{flexDirection: 'row', justifyContent:'space-between'}}>
                  <Text style={{marginTop: 15, fontSize: 18}}>Create new address</Text>
                  <TouchableOpacity onPress={()=> this.setState({visibleEditModal: false,mobile:'',
                                                                                      name:'',
                                                                                      address:'',
                                                                                      postal:'',
                                                                                      city:'',
                                                                                      province:'',
                                                                                      selectedCity: 'Select City/Municipality',
                                                                                      selectedBarangay: 'Select Barangay',})}>
                      <AntDesign name="closecircleo" size={20} color="#687373" style={{marginTop: 5,alignContent: 'flex-end'}}/>
                     
                   </TouchableOpacity>
                   </View>
                  <Text style={{marginTop: 15, fontSize: 10}}>Full Name</Text>
                  <Item regular style={{marginTop: 7}}>
                      <Input placeholder={this.state.name} value={this.state.name}  onChangeText={(text) => this.updateTextInput(text, 'name')} placeholderTextColor="#687373" />
                  </Item>
                  <Text style={{marginTop: 15, fontSize: 10}}>Phone Number</Text>
                  <Item regular style={{marginTop: 7}}>
                      <Input placeholder={this.state.mobile} value={this.state.mobile} keyboardType='numeric'  onChangeText={(text) => this.updateTextInput(text, 'mobile')} placeholderTextColor="#687373" />
                  </Item>
                  <Text style={{marginTop: 15, fontSize: 10}}>Province</Text>
                  <Item regular style={{marginTop: 7}}>
                      <Input placeholder={this.state.province} value={this.state.province}   onChangeText={(text) => this.updateTextInput(text, 'province')} placeholderTextColor="#687373" />
                  </Item>
                  <Text style={{marginTop: 15, fontSize: 10}}>City</Text>
                  <Item>
                   
                    <Picker
                         selectedValue={this.state.selectedCity}
                         onValueChange={(itemValue, itemIndex) => 
                               this.fetchBarangay(itemValue)                        
                             }>     
                            <Picker.Item label = {this.state.selectedCity}  value={this.state.selectedCity}  />
                                                        {this.state.cityList.map(user => (
                              <Picker.Item label={user.datas.label} value={user.datas.label} />
                            ))        }
                    </Picker>
                  </Item>
                        
                   <Text style={{marginTop: 15, fontSize: 10}}>Barangay</Text>
                   {this.state.selectedCity != 'Select City/Municipality' ?
            
                  <Item>
                   
                            <Picker
                                selectedValue={this.state.selectedBarangay}
                                onValueChange={(itemValue, itemIndex) => 
                                    this.setState({selectedBarangay: itemValue})
                                    }>     
                                    <Picker.Item label = {this.state.selectedBarangay}  value={this.state.selectedBarangay}  />
                                                      {this.state.barangayList.map(user => (
                            <Picker.Item label={user.datas.barangay} value={user.datas.barangay} />
                          ))        }
                            </Picker>
                
                    </Item> : null}
                  <Text style={{marginTop: 15, fontSize: 10}}>Postal Address</Text>
                  <Item regular style={{marginTop: 7}}>
                      <Input placeholder={this.state.postal} value={this.state.postal}   onChangeText={(text) => this.updateTextInput(text, 'postal')} placeholderTextColor="#687373" />
                  </Item>
                  <Text style={{marginTop: 15, fontSize: 10}}>Detailed Address</Text>
                  <Item regular style={{marginTop: 7}}>
                      <Input placeholder={this.state.address} value={this.state.address}   onChangeText={(text) => this.updateTextInput(text, 'address')} placeholderTextColor="#687373" />
                  </Item>
                  
                  <Button block style={{ height: 30, backgroundColor:  "salmon", marginTop: 10}}
                    onPress={() => this.onEditSave()}
                  >
                  <Text style={{color:'white'}}>SAVE</Text>
                  </Button>
                  </ScrollView>
              </View>
          </View>
          </Modal>

      </Container>
      </Root>
    );
  }
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
  },
  view: {
    justifyContent: 'flex-end',
    margin: 0,
  },
   content: {
    backgroundColor: 'white',
    padding: 22,
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  cardLayoutView: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff9c4',
  }, 
  paragraphHeading: {
    margin: 24,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'green',
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    textAlign: 'center',
  },
  logo: {
    height: 130,
    width: 130,
    marginBottom: 20,
  },
});