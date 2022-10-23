package com.rarira.yogiyogi;

import android.widget.Toast;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;

import com.kakao.kakaolink.v2.KakaoLinkService;
import com.kakao.kakaolink.v2.KakaoLinkResponse;
import com.kakao.message.template.LocationTemplate;
import com.kakao.message.template.FeedTemplate;
import com.kakao.message.template.LinkObject;
import com.kakao.message.template.ButtonObject;
import com.kakao.message.template.SocialObject;
import com.kakao.message.template.ContentObject;

import com.kakao.network.callback.ResponseCallback;
import com.kakao.network.ErrorResult;

import java.util.Map;
import java.util.HashMap;

public class RariraKakaoLink extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    RariraKakaoLink(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @Override
    public String getName() {
        return "RariraKakaoLink";
    }

    @ReactMethod
    public void link(String title, String desc, String imageURL, String webLink, String appLink, String address,
            String addressTitle, final Callback successCallback) {
        LocationTemplate params = LocationTemplate.newBuilder(address, ContentObject
                .newBuilder(title, imageURL,
                        LinkObject.newBuilder().setWebUrl("https://www.yogiyogi.kr/app").setMobileWebUrl(webLink)
                                .setAndroidExecutionParams(appLink).setIosExecutionParams(appLink).build())
                .setDescrption(desc).build()).setAddressTitle(addressTitle).build();

        Map<String, String> serverCallbackArgs = new HashMap<String, String>();
        serverCallbackArgs.put("user_id", "${current_user_id}");
        serverCallbackArgs.put("product_id", "${shared_product_id}");

        KakaoLinkService.getInstance().sendDefault(this.getCurrentActivity(), params, serverCallbackArgs,
                new ResponseCallback<KakaoLinkResponse>() {
                    @Override
                    public void onFailure(ErrorResult errorResult) {
                        successCallback.invoke(errorResult.toString());
                    }

                    @Override
                    public void onSuccess(KakaoLinkResponse result) {
                        successCallback.invoke(result);
                    }
                });
    }

    @ReactMethod
    public void feed(String title, String desc, String imageURL, String webLink, String appLink, Integer likeCount,
            Integer commentCount, final Callback successCallback) {
        FeedTemplate params = FeedTemplate
                .newBuilder(ContentObject.newBuilder(title, imageURL,
                        LinkObject.newBuilder().setWebUrl("https://www.yogiyogi.kr/app").setMobileWebUrl(webLink)
                                .build())
                        .setDescrption(desc).build())
                .setSocial(SocialObject.newBuilder().setLikeCount(likeCount).setCommentCount(commentCount).build())

                .addButton(new ButtonObject("자세히 보기",
                        LinkObject.newBuilder().setWebUrl("https://www.yogiyogi.kr/app").setMobileWebUrl(webLink)
                                .setAndroidExecutionParams(appLink).setIosExecutionParams(appLink).build()))
                .build();

        Map<String, String> serverCallbackArgs = new HashMap<String, String>();
        serverCallbackArgs.put("user_id", "${current_user_id}");
        serverCallbackArgs.put("product_id", "${shared_product_id}");

        KakaoLinkService.getInstance().sendDefault(this.getCurrentActivity(), params, serverCallbackArgs,
                new ResponseCallback<KakaoLinkResponse>() {
                    @Override
                    public void onFailure(ErrorResult errorResult) {
                        successCallback.invoke(errorResult.toString());
                    }

                    @Override
                    public void onSuccess(KakaoLinkResponse result) {
                        successCallback.invoke(result);
                    }
                });
    }
}