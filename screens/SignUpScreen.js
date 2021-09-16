import React,{Component} from 'react';
import { 
    Text, 
    TouchableOpacity, 
    Dimensions,
    TextInput,
    Platform,
    StyleSheet ,
    StatusBar,
    ScrollView
} from 'react-native';
import { Container, View, Left, Right, Button, Icon, Item, Input, DatePicker, Picker } from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Loader from '../components/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from 'react-native-vector-icons/AntDesign'


export default class SignUpScreen extends Component {
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
              city:'',
              province:'',
              PickerValueHolder: 'Select Barangay',
              barangayList: [],
              cityList:[],
              userTypes: [{userType: 'admin', userName: 'Admin User'}, {userType: 'employee', userName: 'Employee User'}, {userType: 'dev', userName: 'Developer User'}],
              selectedCity: 'Select City/Municipality',
              selectedBarangay: 'Select Barangay'
            };
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

  fetchBarangay =(city)=>{
    this.setState({ selectedCity: city })
    this.subscribe = this.barangayRef.collection('barangay').where('city', '==', city).onSnapshot(this.onBarangayUpdate)
  }
      
        componentDidMount(){
          this.tosubscribe = this.cityRef.onSnapshot(this.onCityUpdate);
        }

        signup() {
          this.setState({ loading: true});
          if(this.state.email===""||this.state.name===""||this.state.username===""||this.state.email===""||this.state.password===""||this.state.rePassword===""||this.state.address==""||this.state.selectedBarangay=="Select Barangay"||this.state.selectedCity=="Select City/Municipality"||this.state.province=="") {
            this.setState({hasError: true, errorText: 'Please fill all fields !',loading: false});
            return;
          }
          if(!this.verifyEmail(this.state.email)) {
            this.setState({hasError: true, errorText: 'Please enter a valid email address !',loading: false});
            return;
          }
          
          if(this.state.username.length < 3) {
            this.setState({hasError: true, errorText: 'Username must contains at least 3 characters !',loading: false});
            return;
          }
          if(this.state.mobile.length < 11|| this.state.mobile.length > 11) {
            this.setState({hasError: true, errorText: 'Mobile number must contains at least 11 characters !',loading: false});
            return;
          }
          if(this.state.password.length < 6) {
            this.setState({hasError: true, errorText: 'Passwords must contains at least 6 characters !',loading: false});
            return;
          }
          if(this.state.password !== this.state.rePassword) {
            this.setState({hasError: true, errorText: 'Passwords does not match !',loading: false});
            return;
          }
          this.setState({hasError: false});
          const { email, password } = this.state
          auth()
            .createUserWithEmailAndPassword(email, password)
            .then(() => {
              this.saveUserdata();
          }).catch((error) => {
           this.setState({hasError: true, errorText: error.message, loading: false})  // Using this line
        });
      
        }
      
        saveUserdata() {
         const newDocumentID =  firestore().collection('users').doc().id;
          const userId =  auth().currentUser.uid;
          AsyncStorage.setItem('uid', userId);
          this.ref.collection('users').doc(userId).set({
            Name: this.state.name,
            Username: this.state.username,
            Mobile: this.state.mobile,
            Email: this.state.email,
            Password: this.state.password,
            ordered_times: 0,
            Gender: '',
            Birthdate: '',
            userId: userId,
            status: 'New',
            ordered_times: 0,
            Address: {
              Address: this.state.address,
              Barangay: this.state.selectedBarangay,
              City: this.state.selectedCity,
              Province: this.state.province,
              Country: 'Philippines'
            },
            Shipping_Address: [{
              id: newDocumentID,
              default: true,
              name:this.state.name,
              phone: this.state.mobile,
              address: this.state.address,
              barangay: this.state.selectedBarangay,
              city: this.state.selectedCity,
              province: this.state.province,
              postal:'8600'
            
            }]
          }).then((docRef) => {
            this.setState({
              loading: false,
            });
            this.props.navigation.navigate('App')
          })
        }
      
        verifyEmail(email) {
          var reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return reg.test(email);
        }
      
      
    render() {
      return (
        <Container style={{flex: 1,backgroundColor: '#fdfdfd'}}>
        <ScrollView contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps="always">
          <Loader loading={this.state.loading} />
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingLeft: 50, paddingRight: 50, marginTop: 20}}>
            <View style={{marginBottom: 35, width: '100%'}}>
              <Text style={{fontSize: 24, fontWeight: 'bold', textAlign: 'left', width: '100%', color: 'red'}}>Create your account, </Text>
              <Text style={{fontSize: 18, textAlign: 'left', width: '100%', color: '#687373'}}>Signup to continue </Text>
              <Text style={{fontSize: 15, textAlign: 'left', width: '100%', color: 'red'}}>{this.state.errorText} </Text>
            </View>
            <Item>
                <AntDesign name="mail" size={20} color={"#687373"}/>
                <Input placeholder='Email' onChangeText={(text) => this.setState({email: text})} keyboardType="email-address" placeholderTextColor="#687373" />
            </Item>
            <Item>
                <AntDesign name="user" size={20} color={"#687373"}/>
                <Input placeholder='Name' onChangeText={(text) => this.setState({name: text})} placeholderTextColor="#687373" />
            </Item>
            <Item>
                <AntDesign name="user" size={20} color={"#687373"}/>
                <Input placeholder='Username' onChangeText={(text) => this.setState({username: text})} placeholderTextColor="#687373" />
            </Item>
            <Item>
                <AntDesign name="mobile1" size={20} color={"#687373"}/>
                <Input placeholder='Mobile Number' onChangeText={(text) => this.setState({mobile: text})} placeholderTextColor="#687373" />
            </Item>
            <Item>
                <AntDesign name="enviromento" size={20} color={"#687373"}/>
                <Input placeholder='Province' onChangeText={(text) => this.setState({province: text})} placeholderTextColor="#687373" />
            </Item>
            <Item>
            <AntDesign name="enviromento" size={20} color={"#687373"}/>
                    <Picker
                         selectedValue={this.state.selectedCity}
                         onValueChange={(itemValue, itemIndex) => 
                               this.fetchBarangay(itemValue)                        
                             }>     
                            <Picker.Item label = {this.state.selectedCity}  value={this.state.selectedCity}  />
                              {this.state.cityList.map((user, index) => (
     <Picker.Item label={user.datas.label} value={user.datas.label} key={index}/>
  ))        }
                    </Picker>
        
            </Item>
           {this.state.selectedCity != 'Select City/Municipality' ?
           <Item>
            <AntDesign name="enviromento" size={20} color={"#687373"}/>
                    <Picker
                         selectedValue={this.state.selectedBarangay}
                         onValueChange={(itemValue, itemIndex) => 
                             this.setState({selectedBarangay: itemValue})
                             }>     
                             <Picker.Item label = {this.state.selectedBarangay}  value={this.state.selectedBarangay}  />
                                              {this.state.barangayList.map((user,index) => (
                    <Picker.Item label={user.datas.barangay} value={user.datas.barangay} key={index}/>
                  ))        }
                    </Picker>
        
            </Item> : null}
            <Item>
            <AntDesign name="enviromento" size={20} color={"#687373"}/>
                <Input placeholder='Detailed Address' onChangeText={(text) => this.setState({address: text})} placeholderTextColor="#687373" />
            </Item>
            <Item>
         
              </Item>      
            <Item>
            <AntDesign name="key" size={20} color={"#687373"}/>
                <Input placeholder='Password' onChangeText={(text) => this.setState({password: text})} secureTextEntry={true} placeholderTextColor="#687373" />
            </Item>
            <Item>
            <AntDesign name="key" size={20} color={"#687373"}/>
                <Input placeholder='Repeat your password' onChangeText={(text) => this.setState({rePassword: text})} secureTextEntry={true} placeholderTextColor="#687373" />
            </Item>
            {this.state.hasError?<Text style={{color: "#c0392b", textAlign: 'center', marginTop: 10}}>{this.state.errorText}</Text>:null}
            <View style={{alignItems: 'center'}}>
              <Button onPress={() => this.signup()} style={{backgroundColor: 'red', marginVertical: 20,width: '100%',
                                                                                      height: 50,
                                                                                      justifyContent: 'center',
                                                                                      alignItems: 'center',
                                                                                      borderRadius: 10, borderWidth: 1, borderColor: 'red'}}>
                <LinearGradient
                    colors={['tomato', 'red']}
                    style={styles.signIn}
                >
                    <Text style={[styles.textSign, {
                        color:'#fff'
                    }]}>Sign Up</Text>
                </LinearGradient>
              </Button>
            </View>
            <View style={{alignItems: 'center'}}>
              <Button onPress={() => this.props.navigation.navigate('Login')} style={{backgroundColor: 'red', marginVertical: 20,width: '100%',
                                                                                      height: 50,
                                                                                      justifyContent: 'center',
                                                                                      alignItems: 'center',
                                                                                      borderRadius: 10, borderWidth: 1, borderColor: 'red'}}>
                 <LinearGradient
                    colors={['tomato', 'red']}
                    style={styles.signIn}
                >
                    <Text style={[styles.textSign, {
                        color:'#fff'
                    }]}>Already have account? Sign In</Text>
                </LinearGradient>
              </Button>
            </View>
          </View>
        </ScrollView>
      </Container>
    );
            }
};


const styles = StyleSheet.create({
    container: {
      flex: 1, 
      backgroundColor: '#009387'
    },
    header: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingBottom: 50
    },
    footer: {
        flex: 3,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 30
    },
    text_header: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 30
    },
    text_footer: {
        color: '#05375a',
        fontSize: 18
    },
    action: {
        flexDirection: 'row',
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
        paddingBottom: 5
    },
    textInput: {
        flex: 1,
        marginTop: Platform.OS === 'ios' ? 0 : -12,
        paddingLeft: 10,
        color: '#05375a',
    },
    button: {
        alignItems: 'center',
        marginTop: 50
    },
    signIn: {
        width: '100%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10
    },
    textSign: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    textPrivate: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 20
    },
    color_textPrivate: {
        color: 'grey'
    }
  });
