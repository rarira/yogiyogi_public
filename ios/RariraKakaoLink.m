//
//  RariraKakaoLink.m
//  yogiyogi
//
//  Created by Inseong Park on 2019/12/13.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "RariraKakaoLink.h"
#import <React/RCTLog.h>
#import <KakaoOpenSDK/KakaoOpenSDK.h>

#import <KakaoLink/KakaoLink.h>
#import <KakaoMessageTemplate/KakaoMessageTemplate.h>

@implementation RariraKakaoLink

RCT_EXPORT_MODULE();

//RCT_EXPORT_METHOD(greet:(NSString *)name) {
//  RCTLogInfo(@"Welcome, %@", name);
//}

RCT_EXPORT_METHOD(link:(NSString *)title desc:(NSString *)desc imageURL:(NSString *)imageURL link:(NSString *)link appLink:(NSString *)appLink  address:(NSString *)address addressTitle:(NSString *)addressTitle callback:(RCTResponseSenderBlock)callback)
{
    KMTTemplate *template = [KMTLocationTemplate locationTemplateWithBuilderBlock:^(KMTLocationTemplateBuilder * _Nonnull locationTemplateBuilder) {
      locationTemplateBuilder.address = address;
        locationTemplateBuilder.addressTitle = addressTitle;
        locationTemplateBuilder.content = [KMTContentObject contentObjectWithBuilderBlock:^(KMTContentBuilder * _Nonnull contentBuilder) {
            contentBuilder.title =title;
            contentBuilder.desc =desc;
            contentBuilder.imageURL = [NSURL URLWithString:imageURL];
            contentBuilder.link = [KMTLinkObject linkObjectWithBuilderBlock:^(KMTLinkBuilder * _Nonnull linkBuilder) {
                linkBuilder.webURL = [NSURL URLWithString:@"https://www.yogiyogi.kr/app"];
                linkBuilder.mobileWebURL = [NSURL URLWithString:link];
                linkBuilder.androidExecutionParams = appLink;
                linkBuilder.iosExecutionParams = appLink;
            }];
        }];
    }];


    [[KLKTalkLinkCenter sharedCenter] sendDefaultWithTemplate:template success:^(NSDictionary<NSString *,NSString *> * _Nullable warningMsg, NSDictionary<NSString *,NSString *> * _Nullable argumentMsg) {
        // 성공
        RCTLogInfo(@"warning message: %@", warningMsg);
        RCTLogInfo(@"argument message: %@", argumentMsg);
    } failure:^(NSError * _Nonnull error) {
        // 에러
        RCTLogInfo(@"error: %@", error);
    }];
}

RCT_EXPORT_METHOD(feed:(NSString *)title desc:(NSString *)desc imageURL:(NSString *)imageURL link:(NSString *)link appLink:(NSString *)appLink
                  likeCount:(nonnull NSNumber *)likeCount  commentCount:(nonnull NSNumber *)commentCount   callback:(RCTResponseSenderBlock)callback)
{
  
  
  KMTTemplate *template = [KMTFeedTemplate feedTemplateWithBuilderBlock:^(KMTFeedTemplateBuilder * _Nonnull feedTemplateBuilder) {

      // 콘텐츠
      feedTemplateBuilder.content = [KMTContentObject contentObjectWithBuilderBlock:^(KMTContentBuilder * _Nonnull contentBuilder) {
          contentBuilder.title = title;
          contentBuilder.desc = desc;
          contentBuilder.imageURL = [NSURL URLWithString:imageURL];
          contentBuilder.link = [KMTLinkObject linkObjectWithBuilderBlock:^(KMTLinkBuilder * _Nonnull linkBuilder) {
              linkBuilder.webURL = [NSURL URLWithString:@"https://www.yogiyogi.kr/app"];
              linkBuilder.mobileWebURL = [NSURL URLWithString:link];

          }];
      }];

      // 소셜
      feedTemplateBuilder.social = [KMTSocialObject socialObjectWithBuilderBlock:^(KMTSocialBuilder * _Nonnull socialBuilder) {
          socialBuilder.likeCount = likeCount;
          socialBuilder.commnentCount = commentCount;

      }];

      [feedTemplateBuilder addButton:[KMTButtonObject buttonObjectWithBuilderBlock:^(KMTButtonBuilder * _Nonnull buttonBuilder) {
          buttonBuilder.title = @"자세히 보기";
          buttonBuilder.link = [KMTLinkObject linkObjectWithBuilderBlock:^(KMTLinkBuilder * _Nonnull linkBuilder) {
              linkBuilder.webURL = [NSURL URLWithString:@"https://www.yogiyogi.kr/app"];
              linkBuilder.mobileWebURL = [NSURL URLWithString:link];
              linkBuilder.androidExecutionParams = appLink;
              linkBuilder.iosExecutionParams = appLink;
          }];
      }]];
  }];
  

    [[KLKTalkLinkCenter sharedCenter] sendDefaultWithTemplate:template success:^(NSDictionary<NSString *,NSString *> * _Nullable warningMsg, NSDictionary<NSString *,NSString *> * _Nullable argumentMsg) {
        // 성공
        RCTLogInfo(@"warning message: %@", warningMsg);
        RCTLogInfo(@"argument message: %@", argumentMsg);
    } failure:^(NSError * _Nonnull error) {
        // 에러
        RCTLogInfo(@"error: %@", error);
    }];
}

@end
