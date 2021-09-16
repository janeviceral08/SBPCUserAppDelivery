import React, { Component } from 'react';
import {View, Image, Dimensions, SafeAreaView, ScrollView,Alert,Linking,TouchableOpacity } from 'react-native';
import {Container, Header , Left, Right,Body, Button, Icon, Title, Text, List, ListItem, Row, Grid} from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';

class SideMenu extends Component {
   constructor(props) {
    super(props);
 
    this.state = {
      loggedIn: ''
    };
    
  }

  async componentDidMount(){
      const userId= await AsyncStorage.getItem('uid');
   
      this.setState({
        loggedIn : userId
      })
  }

  signOut (){
          auth().signOut().then(() => {
            AsyncStorage.removeItem('uid');
            Alert.alert(
                "You have successfully logged out.",
                "Please come back soon.",
                [
                  { text: "OK",   onPress: () => this.props.navigation.navigate('Auth')}  
                ],
                { cancelable: false }
              );
           
        })
        .catch(error => this.setState({ errorMessage: error.message }))
    }

  render(){
    const {loggedIn} = this.state;
    return(
      <SafeAreaView style={{flex: 1}}>
        <View style={{justifyContent: 'center', alignItems:'center'}}>
          <Image source={require('../assets/k.png')} 
            style={{height: 170, width: Dimensions.get('window').width * 3/4}}
          />
        </View>
        <ScrollView>
          <List>
            <ListItem onPress={()=> this.props.navigation.navigate("Support")}>
              <Text>Support</Text>
            </ListItem>
          </List>
        </ScrollView>
         <List style={{justifyContent:'flex-end'}}>
         {
           loggedIn ?
            <ListItem onPress={()=> this.signOut()}>
              <Text>Log Out</Text>
            </ListItem> :
             <ListItem onPress={()=> this.props.navigation.navigate("Auth")}>
              <Text>Sign In</Text>
            </ListItem>
         }
           <ListItem>
            <View>
            <Grid>
              <Row style={{alignItems: 'center'}}><TouchableOpacity style={{flexDirection: 'row'}} onPress={() => Linking.openURL('https://icons8.com').catch(err => console.error('An error occurred', err))} ><Text style={{fontSize: 8}}> Icons by Icons8</Text></TouchableOpacity></Row>
            </Grid>
          </View>
           </ListItem>
          </List>
          
      </SafeAreaView>
    )
  }
}

export default SideMenu;