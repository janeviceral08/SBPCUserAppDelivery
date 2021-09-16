import React, { Component } from 'react';
import { StyleSheet, Text, View, Button,Image, FlatList } from 'react-native';
import {Card, CardItem, Thumbnail, Body, Left, Header, Right, Title} from 'native-base';
import ConfettiCannon from 'react-native-confetti-cannon';
import { TouchableOpacity } from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class VoucherScreen extends Component {

  constructor() {
    super();
    this.ref =  firestore();
    this.unsubscribe = null;
    this.state = {
      //defalt false and if true cannon will be fired
      shoot: false,
      dataSource: [],
      vouchers:[]
    };
  }

  
  onCollectionUpdate = (querySnapshot) => {
    const vouchers = [];
    querySnapshot.forEach((doc) => {
        vouchers.push ({
            datas : doc.data(),
            key : doc.id
            });
    })
    this.setState({
      dataSource : vouchers,
   })

  }

  async component (){
    let userId= await AsyncStorage.getItem('uid');
 	/* Listen to realtime cart changes */
     this.unsubscribeCartItems =  firestore().collection('user_vouchers').doc(userId).onSnapshot(snapshotCart => {
        if(snapshotCart.data()){
            this.setState({vouchers: snapshotCart.data(), loading: false});
        } else {
            this.setState({vouchers: [], loading: false});
        }
    });
  }

  componentDidMount() {
    this.setState({loading: true})
    //Time out to fire the cannon
    this.unsubscribe = this.ref.collection('vouchers').onSnapshot(this.onCollectionUpdate) ;
    
   this.component();

  }
  

  

	
 async onClaimVoucher(data) {
    const { vouchers } = this.state;
 
        let is_existing = Object.keys(vouchers).length && Object.values(vouchers).find(item => data.id === item.id); /* Check if item already exists in cart from state */
        if(!is_existing){
            let newItem = {
                'id': data.id,
                'store_name': data.store_name,
                'store_id': data.store_id,
                'minimum': data.minimum,
                'validity': data.validity,
                'store_image': data.store_image,
                'amount': data.amount,
                'status': 'available'
            };
            let userId= await AsyncStorage.getItem('uid');
            let updatedData = Object.values(vouchers); /* Clone it first */
            let voucherRef =  firestore().collection('user_vouchers');
            
            /* Push new cart item */
            updatedData.push(newItem); 
            
            /* Set updated cart in firebase, no need to use setState because we already have a realtime cart listener in the componentDidMount() */
            voucherRef.doc(userId).set(Object.assign({}, updatedData)).then(() => {
                alert('Voucher successfully claimed.');
                this.setState({ shoot: true });
            });
        }else{
            alert('Voucher already claimed.')
        }
}


  render() {
    return (
      <View style={styles.Container}>
                <Header style={{backgroundColor:'#FFFFFF',}}>
                <Left> 
                </Left>
                <Body style={{justifyContent: "center", alignContent: "center"}}>
                    <Title style={{color: '#1aad57'}}>Free Vouchers</Title>
                </Body>
                <Right />
                </Header>
                <FlatList
                    data={this.state.dataSource}
                    renderItem={({ item }) => 
                    <Card transparent>
                    <CardItem style={{borderRadius: 20, borderWidth: 0.1, marginHorizontal: 10}}> 
                    <View style={{flexDirection: 'column', paddingRight: 10}}>          
                     <Thumbnail style={{padding: 0, margin: 0}}  source={{uri: item.datas.store_image}} /> 
                        <Text style={{fontSize: 7}}>{item.datas.store_name}</Text> 
                     </View> 
                      <Body style={{paddingLeft: 10, paddingTop: 10}}>
                          <Text style={{fontSize: 14, fontWeight:'bold'}}>₱{item.datas.amount} off</Text>
                          <Text note style={{color:'red', fontSize: 12, fontWeight: 'bold'}}>Min. Spend {item.datas.minimum}</Text>
                          <View>
                             <Text note style={{ color: 'tomato', fontSize: 9}}>Valid Till: {item.datas.validity}</Text>
                          </View>
                      </Body>
                      <Right style={{justifyContent: "flex-end", alignContent: "flex-end"}}>
                          <TouchableOpacity style={{padding: 5, backgroundColor:'tomato',borderRadius: 10,}} onPress={() => this.onClaimVoucher(item.datas)}>
                          <Text style={{ color: 'white'}}>Claim</Text>
                          </TouchableOpacity>
                      </Right>

                    </CardItem>
                  </Card>  
                    }
                    keyExtractor={item => item.key}
                />
                  
        {this.state.shoot ? (
          <ConfettiCannon count={200} explosionSpeed={350} origin={{ x: -10, y: 10 }} />
        ) : null}

      </View>
    );
  }
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
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