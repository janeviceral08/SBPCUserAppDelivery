import { LayoutProvider } from 'recyclerlistview';
import { Dimensions } from 'react-native';
const SCREEN_WIDTH = Dimensions.get('window').width;

export class LayoutUtil {
  static getWindowWidth() {
    // To deal with precision issues on android
    return Math.round(Dimensions.get('window').width * 1000) / 1000 - 6; //Adjustment for margin given to RLV;
  }
  static getLayoutProvider(type) {
    switch (type) {
      case 1:
        return new LayoutProvider(
          () => {
            return 'VSEL';
          },
          (type, dim) => {
            switch (type) {
              case 'VSEL':
                dim.width = SCREEN_WIDTH / 2 - 8;
                dim.height = 280;
                break;
              default:
                dim.width = 0;
                dim.heigh = 0;
            }
          }
        );
      default:
        return new LayoutProvider(
          () => {
            return 'VSEL';
          },
          (type, dim) => {
            switch (type) {
              case 'VSEL':
                dim.width = (Math.round(Dimensions.get('window').width * 1000) / 1000)/2 - 6;
                dim.height = 250;
                break;
              default:
                dim.width = 0;
                dim.heigh = 0;
            }
          }
        );
    }
  }
}
