/**
* This is the Main file
**/

// React native and others libraries imports
import React, { Component } from 'react';
import { Container, Content, View, Left, Right, Button, Grid, Col, Badge, Card,Header, Body,Text } from 'native-base';
import {FlatList,TouchableOpacity, StyleSheet} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import StoreCard from '../components/StoreCard';
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { RadioButton } from 'react-native-paper';
import Modal from 'react-native-modal';
import Loader from '../components/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomHeader from './Header';
import Icon from 'react-native-vector-icons/Feather';
import DropDownPicker from 'react-native-dropdown-picker';

export default class Stores extends Component {
 
  constructor(props) {
      super(props);
      this.cityRef =  firestore();
      this.subscribe=null;
       console.log('params: ',this.props.route.params)
      const store = this.props.route.params.store;
     
      this.ref =  firestore()
      this.state = {
        dataSource: [],
        section: store ,
        loading: false,
        selectedCity: "All",
        visibleModal: false,
        City: '',
        country:'',
        cities: [],
      };

  }

  async getStores(db){
    const city = [];
    await db.get()
      .then(querySnapshot => {
        querySnapshot.docs.forEach(doc => {
        city.push(doc.data());
        
      });
    }); 
    this.setState({
      dataSource: city
    }) 
  }
  
_bootstrapAsync =async(selected,item) =>{
  console.log(selected)
  const userId= await AsyncStorage.getItem('uid');
  if(userId && !selected){
    let db=  firestore().collection('stores').where('section', '==', this.state.section).where('city','==',this.state.City).orderBy('arrange', 'asc');
    this.getStores(db)
  }else if(selected){
    let db=  firestore().collection('stores').where('section', '==', this.state.section).where('city','==',item).orderBy('arrange', 'asc');
    this.getStores(db)
  }else{
    let db=  firestore().collection('stores').where('section', '==', this.state.section).orderBy('arrange', 'asc');
    this.getStores(db)
  }
}
 async getUserCity(){
   
    const userId= await AsyncStorage.getItem('uid');
    console.log('userId: ', userId)
    this.subscribe = this.cityRef.collection('users').where('userId','==', userId).onSnapshot(this.onCityUpdate)
   
  }

  onCollectionUpdate = (querySnapshot) => {
    this.setState({
      loading: true,
      
   });
    const stores = [];
    querySnapshot.forEach((doc) => {
     stores.push ({
            datas : doc.data(),
            key : doc.id
            });
    });
    this.setState({
      dataSource : stores,
      loading: false,
      
   });
  
  }

  async getAllCity() {
    const city = [];
    await  firestore().collection('city').get()
      .then(querySnapshot => {
        querySnapshot.docs.forEach(doc => {
        city.push(doc.data());
        
      });
    }); 

    this.setState({
      cities: city
    })  
  }


  
  onCityUpdate = (querySnapshot) => {
   querySnapshot.forEach((doc) => {
    this.setState({
      City: doc.data().Address.City,
   });      
   });
   this._bootstrapAsync(false,null);
  }

  componentDidMount() {
    this.getAllCity()
    this.getUserCity();
  
  }


  render() {
    const { selectedCity } = this.state;
    console.log('this.state.cities: ', this.state.cities)
    return(
          <Container style={{backgroundColor: '#fdfdfd'}}>
          <CustomHeader title="Stores"  navigation={this.props.navigation}/>
          <DropDownPicker
                items={this.state.cities}
          
                defaultValue={this.state.country}
                placeholder="Select City"
                containerStyle={{height: 35}}
                labelStyle={{
                  fontSize: 14,
                  textAlign: 'center',
                  color: '#000'
              }}
              showArrow = {false}
                style={{backgroundColor: '#ffffff'}}
                itemStyle={{
                    justifyContent: 'center'
                }}
                dropDownStyle={{backgroundColor: '#ffffff'}}
                onChangeItem={item => this._bootstrapAsync(true, item.label)}
            />
            <Loader loading={this.state.loading}/>
              <FlatList
                  data={this.state.dataSource}
                  renderItem={({ item }) => (
                    <Card transparent>
                        <StoreCard product={item} navigation={this.props.navigation}/>
                    </Card>
                  )}
                  keyExtractor = { (item,index) => index.toString() }
                />
             
          </Container>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  headerContainer: {
    marginTop: 5
  },
  headerText: {
    color:'black'
  },
  tabItemContainer: {
    backgroundColor: "#cf6bab"
  },
  content: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
});