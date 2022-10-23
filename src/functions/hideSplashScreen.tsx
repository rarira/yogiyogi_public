import RNBootSplash from 'react-native-bootsplash';

export default async function() {
  // let bsStatus = 'transitioning';
  // RNBootSplash.getVisibilityStatus().then(status => {
  //   console.log('bootsplash status', status);
  //   bsStatus = status;
  // });

  // if (bsStatus !== 'hidden') {
  RNBootSplash.hide({ fade: true })
    // .then(result => console.log('splash', result))
    .catch(e => console.log('splash', e));
  // }
}
