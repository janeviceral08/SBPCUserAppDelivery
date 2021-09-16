
import React, { Component } from 'react';
import { Content, Right, Card, CardItem, Body,Item, Input,Text, Form, Textarea, Button } from 'native-base';
import {SafeAreaView, TouchableOpacity, FlatList, StyleSheet, View} from 'react-native';
import Modal from 'react-native-modal';
// Our custom files and classes import


export default class AccountInfo extends Component {
  constructor(props) {
      super(props);
      this.state = {
       mobile : '',
       name : '',
       address:"",
       visibleModal: false
      };

  }

changeAddress(item){
  this.setState({
    
  })
}

 footer= () => {
    return(
    <View>
      <Button block  style={{alignSelf:'center'}} light>
            <Text>Add Address</Text>
      </Button>
    </View>
    )
  }


  render() {
    
    return(            
            <SafeAreaView >
               <Card  elevation={5} style={{borderColor: '#ddd', padding: 5, flex:1}}>
                     <CardItem header>    
                        <Text style={{fontSize: 16,fontWeight:'bold', color: 'tomato'}}>Delivery Details</Text>    
                        <Body />
                        <Right style={{flexDirection: 'row', justifyContent:'flex-end'}}>
                            <TouchableOpacity style={{ paddingRight: 5}} onPress={()=> this.setState({visibleModal: true})}>
                                <Text style={{color:'red'}}>CHANGE</Text>
                            </TouchableOpacity>
                           
                        </Right>
                    </CardItem>
                    <Form>
                        <Textarea rowSpan={3} value={this.state.address} bordered  placeholder="Street Name, Streeet Number" onChangeText={(text) => this.setState({address: text})} disabled/>
                    </Form>
                </Card> 
                 <Modal
                  useNativeDriver={true}
                  isVisible={this.state.visibleModal}
                  onSwipeComplete={this.close}
                  swipeDirection={['up', 'left', 'right', 'down']}
                  style={styles.view}
                  onBackdropPress={() => this.setState({visibleModal: false})} transparent={true}>
                <View style={styles.content}> 
                    <View>
                      <Text style={{textAlign:'center'}}> Select Address </Text>
                      <FlatList
                          data={this.props.address_list}
                          ListFooterComponent={this.footer}
                          renderItem={({ item }) => 
                          <Card transparent>
                          <CardItem style={{borderRadius: 10, borderWidth: 0.1, marginHorizontal: 10}} onPress={()=> this.changeAddress(item)}>                     
                            <View style={{flex: 1, flexDirection: 'column'}}>
                              <Text style={{fontSize: 14}}>{item.name} | {item.phone} {"\n"}{item.address}, {item.barangay}, {item.city}, {item.province}, {item.postal}</Text>
                            </View>                    
                          </CardItem>
                        </Card>  
                          }
                          keyExtractor={item => item.key}
                      />
                    </View>
                </View>
                </Modal>
            </SafeAreaView>   
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