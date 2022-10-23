import MapView, { Marker } from 'react-native-maps';
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';

interface Props {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
}

const CenterMapView = ({ latitude, longitude, name, address }: Props) => {
  const coordinate = {
    latitude,
    longitude,
  };

  return (
    <View style={styles.mapContainer}>
      <MapView
        region={{
          ...coordinate,
          latitudeDelta: 0.0108,
          longitudeDelta: 0.0108,
        }}
        style={styles.mapViewStyle}
        showsUserLocation={true}
        userLocationAnnotationTitle="현재 위치"
        zoomControlEnabled
        showsMyLocationButton={true}
      >
        <Marker coordinate={coordinate} title={name} description={address} />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    margin: 0,
    width: '100%',
    height: 300,
    alignItems: 'center',
  },
  mapViewStyle: StyleSheet.absoluteFillObject,
});

export default memo(CenterMapView);
