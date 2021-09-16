import React, { Component } from 'react';
import {StyleSheet,View, ScrollView} from 'react-native'
import { Container, Header, Button, ListItem, Text, Icon, Left, Body, Right, Switch } from 'native-base';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Ionicons from 'react-native-vector-icons/Ionicons'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, Title, Paragraph, Avatar } from 'react-native-paper';
import { TouchableOpacity } from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import CustomHeader from './Header';
import auth from '@react-native-firebase/auth';

export default class ProfileScreen extends Component {
  constructor() {
    super();
    this.state = {
      uid:'',
      name:'',
      email:'',
      mobile:'',
      address: {},
      country: '',
      province:'',
      zipcode: '',
      username:'',
       loggedIn: ''    };
      this.FetchProfile();
  }

  
  FetchProfile = async() => {
    const userId= await AsyncStorage.getItem('uid');
 this.setState({
        loggedIn : userId
      })
    const ref =  firestore().collection('users').doc(userId);  
    ref.get().then((doc) => {
      if (doc.exists) { 
        const data = doc.data();
        this.setState({
          key: doc.id,
          name: data.Name,
          email: data.Email,
          mobile: data.Mobile,
          address: data.Address,
          username: data.Username
        });
      }
    });

  }

  _bootstrapAsync =async () =>{
    const userId= await AsyncStorage.getItem('uid');
    
    if(userId){
    this.FetchProfile();
    this.setState({ uid: userId })
  }
  };


  signOut (){
          auth().signOut().then(() => {
            AsyncStorage.removeItem('uid');
            Alert.alert(
                "You have successfully logged out.",
                "Please come back soon.",
                [
                  { text: "OK",   onPress: () => this.props.navigation.navigate('Splash')}  
                ],
                { cancelable: false }
              );
           
        })
        .catch(error => this.setState({ errorMessage: error.message }))
    }

  componentDidMount() {
      this._bootstrapAsync(); 
  }

  render() {
    const {uid}=this.state;
    return (
      <Container>
      <CustomHeader title="Account Settings" isHome={true} Cartoff={true} navigation={this.props.navigation}/>
      {uid ?
        <ScrollView>
        <Card>
        <Card.Title
            title={this.state.name}
            subtitle={this.state.username}
            left={(props) => <Avatar.Text size={64} color="white" style={{backgroundColor: 'salmon'}} {...props} label={this.state.name.slice(0, 1).toUpperCase()} />}
            
          />
          
          </Card>
          <ListItem itemDivider style={{backgroundColor: "#FFFFFF"}}/> 
          <ListItem icon onPress={()=> this.props.navigation.navigate("Edit")}>
            <Left>
              <Button style={{ backgroundColor: "#FFFFFF" }}>
              <MaterialCommunityIcons name="account-edit" size={25} color="salmon" />
              </Button>
            </Left>
            <Body>
              <Text>Profile Settings</Text>
            </Body>
            <Right>       
            <MaterialIcons name="arrow-forward" size={25} color="salmon" />    
            </Right>
          </ListItem>
          <ListItem icon onPress={()=> this.props.navigation.navigate("Address")}>
            <Left>
              <Button style={{ backgroundColor: "#FFFFFF" }}>         
              <MaterialIcons name="edit-location" size={25} color="salmon" />
              </Button>
            </Left>
            <Body>
              <Text>Address Settings</Text>
            </Body>
            <Right>
            <MaterialIcons name="arrow-forward" size={25} color="salmon" />
            </Right>
          </ListItem>

          <ListItem itemDivider style={{backgroundColor: "#FFFFFF"}}/>
          <ListItem icon  onPress={()=> this.props.navigation.navigate("MyVoucher")}>
            <Left>
              <Button style={{ backgroundColor: "#FFFFFF" }}>
              <MaterialCommunityIcons name="ticket" size={25} color="salmon" />
              </Button>
            </Left>
            <Body>
              <Text>My Vouchers</Text>
            </Body>
            <Right>
            <MaterialIcons name="arrow-forward" size={25} color="salmon" />
            </Right>
          </ListItem>
          <ListItem itemDivider style={{backgroundColor: "#FFFFFF"}}/>
 
          <ListItem icon>
            <Left>
              <Button style={{ backgroundColor: "#FFFFFF" }}>
              <MaterialCommunityIcons name="help-box" size={25} color="salmon" />
              </Button>
            </Left>
            <Body>
              <Text>Help</Text>
            </Body>
            <Right>
            <MaterialIcons name="arrow-forward" size={25} color="salmon" />
            </Right>
          </ListItem>
           {this.state.loggedIn ?
            <ListItem icon onPress={()=> this.signOut()}>
            <Left>
              <Button style={{ backgroundColor: "#FFFFFF" }}>
              <MaterialCommunityIcons name="logout" size={25} color="salmon" />
              </Button>
            </Left>
            <Body>
              <Text>Logout</Text>
            </Body>
           
          </ListItem> :
           <ListItem icon onPress={()=> this.props.navigation.navigate("Login")}>
            <Left>
              <Button style={{ backgroundColor: "#FFFFFF" }}>
              <MaterialCommunityIcons name="login" size={25} color="salmon" />
              </Button>
            </Left>
            <Body>
              <Text>Sign In</Text>
            </Body>
           
          </ListItem>
         
         }
         
        </ScrollView>:
          this.state.loggedIn ?
            <ListItem icon onPress={()=> this.signOut()}>
            <Left>
              <Button style={{ backgroundColor: "#FFFFFF" }}>
              <MaterialCommunityIcons name="logout" size={25} color="salmon" />
              </Button>
            </Left>
            <Body>
              <Text>Logout</Text>
            </Body>
           
          </ListItem> :
           <ListItem icon onPress={()=> this.props.navigation.navigate("Login")}>
            <Left>
              <Button style={{ backgroundColor: "#FFFFFF" }}>
              <MaterialCommunityIcons name="login" size={25} color="salmon" />
              </Button>
            </Left>
            <Body>
              <Text>Sign In</Text>
            </Body>
           
          </ListItem>
         
         
          }
      </Container>
    );
  }
}



const styles = StyleSheet.create({
  stepIndicator: {
  marginVertical: 10
},
container: {
   flex:1,
  alignItems: 'center', 
  justifyContent: 'center'
},

})