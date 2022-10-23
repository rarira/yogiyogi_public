package com.rarira.yogiyogi;

import android.os.Bundle; // <- add necessary import

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.facebook.soloader.SoLoader;

import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;
import com.zoontek.rnbootsplash.RNBootSplash; // <- add necessary import

// https://github.com/facebook/react-native/issues/28823
import android.content.Intent;
import android.content.res.Configuration;

public class MainActivity extends ReactActivity {

    // /**
    // * Returns the name of the main component registered from JavaScript.
    // * This is used to schedule rendering of the component.
    // */
    // @Override
    // protected String getMainComponentName() {
    // return "yogiyogi";
    // }

    /**
     * Returns the name of the main component registered from JavaScript. This is
     * used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "yogiyogi";
    }

    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new ReactActivityDelegate(this, getMainComponentName()) {
            @Override
            protected ReactRootView createRootView() {
                return new RNGestureHandlerEnabledRootView(MainActivity.this);
            }
        };
    }

    // copy these lines // https://github.com/facebook/react-native/issues/28823
    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        getReactInstanceManager().onConfigurationChanged(this, newConfig);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SoLoader.init(this, false); // <-This
        super.onCreate(savedInstanceState);
        RNBootSplash.init(R.drawable.bootsplash, MainActivity.this); // <- display the "bootsplash" xml view over our
                                                                     // MainActivity
    }

}
