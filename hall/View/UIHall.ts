//-------------------------------------------------------------------------------------------------
// 大厅界面
//-------------------------------------------------------------------------------------------------
import UIBase from "../../Common/UI/UIBase"
import EventName from "../../Common/Event/EventName"
import PlayerDataModule from "../../Player/Model/PlayerDataModule";
import AppFacade from "../../Framework/AppFacade";
import UIManager from "../../Common/UI/UIManager";
import { UIType } from "../../Common/UI/UIDefine";
import HeadPoolModule from "../../HeadPool/Model/HeadPoolModule";
import Util from "../../Utility/Util";
import MessageModule from "../../Message/Model/MessageModule";
import ItemModule from "../../Item/Model/ItemModule";
import LSModule from "../../LService/Model/LSModule";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIHall extends UIBase 
{
    // 设置按钮
    @property(cc.Button)
    BtnSetting : cc.Button = null;
    // 玩家信息按钮
    @property(cc.Button)
    BtnPlayerInfo : cc.Button = null;
    // 战绩按钮
    @property(cc.Button)
    BtnBattleVideo : cc.Button = null;
    // 邮件按钮
    @property(cc.Button)
    BtnMail : cc.Button = null;
    // 比赛场按钮
    @property(cc.Button)
    BtnBiSaiChang : cc.Button = null;
    // 宝豆数量显示
    @property(cc.Label)
    TxtBaoDou : cc.Label = null;
    // 钻石数量显示
    @property(cc.Label)
    TxtZuanShi : cc.Label = null;
    // 活动节点
    @property(cc.Node)
    Activity : cc.Node = null;
    // 邮件红点显示
    @property(cc.Sprite)
    ImgMailRedPoint : cc.Sprite = null;
    // 商店按钮
    @property(cc.Button)
    BtnShop : cc.Button = null;
    // 当前背景
    @property(cc.Sprite)
    BackGround : cc.Sprite = null;
    // 微信头像
    @property(cc.Sprite)
    PlayerTexture : cc.Sprite = null;
    // 名称
    @property(cc.Label)
    PlayerName : cc.Label = null;
    // 头像
    @property(cc.Component)
    CreatePhoto : cc.Component = null;
    // 背包按钮
    @property(cc.Button)
    BtnBackPack : cc.Button = null;
    // 排行榜按钮
    @property(cc.Button)
    BtnLeaderBoard : cc.Button = null;
    // 朋友场
    @property(cc.Button)
    BtnFriend : cc.Button = null;
    // 娱乐场
    @property(cc.Button)
    BtnPlay : cc.Button = null;
    // 活动
    @property(cc.Button)
    BtnWelfare : cc.Button = null;
    //领钻
    @property(cc.Button)
    BtnCollectDiamonds : cc.Button = null;

    start()
    {
        //加载背景音乐
        AppFacade.Instance.GetSoundManager().PlayBackGroundMusic("music_logo");
        // 启动定位
	    LSModule.StartLocationService();
        cc.systemEvent.on( EventName.EVENT_UI_REFRESH_HEAD                  , this.NotifreshHeadTex         , this );
        cc.systemEvent.on( EventName.EVENT_UI_REFRESH_NAME                  , this.NotifiRefreshName        , this );
        cc.systemEvent.on( EventName.EVENT_UI_ITEM_REFRESH                  , this.RefreshItem              , this );
        cc.systemEvent.on( EventName.EVENT_UI_REFRESH_MAIL_RED_POINT        , this.RefreshMailRedPoint      , this );
        cc.systemEvent.on( EventName.EVENT_UI_REFRESH_HIDE_MAIL_RED_POINT   , this.RefreshHideMailRedPoint  , this );
        this.RefreshName( PlayerDataModule.GetPID() );
        this.HeadTex( PlayerDataModule.GetPID() );
        this.RefreshItem();
    }

    onDestroy()
    {
        cc.systemEvent.off( EventName.EVENT_UI_REFRESH_HEAD                 , this.NotifreshHeadTex         , this );
        cc.systemEvent.off( EventName.EVENT_UI_REFRESH_NAME                 , this.NotifiRefreshName        , this );
        cc.systemEvent.off( EventName.EVENT_UI_ITEM_REFRESH                 , this.RefreshItem              , this );
        cc.systemEvent.off( EventName.EVENT_UI_REFRESH_MAIL_RED_POINT       , this.RefreshMailRedPoint      , this );
        cc.systemEvent.off( EventName.EVENT_UI_REFRESH_HIDE_MAIL_RED_POINT  , this.RefreshHideMailRedPoint  , this );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // 按钮事件回调
    // 点击商城
    private ClickShop()
    {
        this.PlayButtonAudio();
        UIManager.ShowUI(UIType.UI_SHOP);
    }

    // 设置
    private ClickSetting()
    {
        this.PlayButtonAudio();
        UIManager.ShowUI( UIType.UI_SETTING );
    }

    // 玩家信息
    private ClickPlayerInfo()
    {
        this.PlayButtonAudio();
        UIManager.ShowUI( UIType.UI_PLAYERINFO );
    }

    // 战绩
    private ClickBattleVideo()
    {
        this.PlayButtonAudio();
        UIManager.ShowUI(UIType.UI_BATTLE_RECORD);
    }

    // 邮件
    private ClickMail()
    {
        this.PlayButtonAudio();
        UIManager.ShowUI(UIType.UI_MAIL);
    }

    // 比赛
    private ClickMatch()
    {
        this.PlayButtonAudio();
        MessageModule.ShowMessage(31);
    }

    // 背包
    private ClickBackPack()
    {
        this.PlayButtonAudio();
        //MessageModule.ShowMessage(31);
        UIManager.ShowUI(UIType.UI_BACK_PACK)
    }

    // 排行榜
    private ClickLeaderBoard()
    {
        this.PlayButtonAudio();
        MessageModule.ShowMessage(31);
    }

    // 奖励
    private ClickReward()
    {
        this.PlayButtonAudio();
        MessageModule.ShowMessage(31);
    }

    // 朋友场
    private ClickCreateAnJoin()
    {
        this.PlayButtonAudio();
        UIManager.ShowUI(UIType.UI_CREATE_AND_JOIN);
    }

    // 比赛场
    private ClickBiSaiChang()
    {
        this.PlayButtonAudio();
        MessageModule.ShowMessage(31);
    }

    // 福利
    private ClickWelfare()
    {
        this.PlayButtonAudio();
        MessageModule.ShowMessage(31);
    }

    //领钻
    private ClickCollectDiamonds()
    {
        this.PlayButtonAudio();
        UIManager.ShowUI(UIType.UI_COLLECT_DIAMONDS);
    }

    //////////////////////////////////////////////////////////////

    //显示邮箱红点
    private RefreshMailRedPoint()
    {
        if( !this.ImgMailRedPoint.node.active )
        {
            this.ImgMailRedPoint.node.active = true;
        }
    }

    //隐藏邮箱红点
    private RefreshHideMailRedPoint()
    {
        if( this.ImgMailRedPoint.node.active )
        {
            this.ImgMailRedPoint.node.active = false;
        }
    }

    //头像
    public HeadTex( RoleID : number )
    {
        let SelfID = PlayerDataModule.GetPID();
        if( !Util.Equal64Num( SelfID , RoleID ) ) return;
        let HeadTex = HeadPoolModule.GetWxHead( PlayerDataModule.GetUserName() , RoleID );
        if( HeadTex == null ) return;
        if( this.PlayerTexture == null ) return;
        this.PlayerTexture.spriteFrame = new cc.SpriteFrame(HeadTex);
    }

    // 头像回调
    public NotifreshHeadTex( Message )
    {
        let RoleID = Message.detail;
        let SelfID = PlayerDataModule.GetPID();
        if( !Util.Equal64Num( SelfID , RoleID ) ) return;
        let HeadTex = HeadPoolModule.GetWxHead( PlayerDataModule.GetUserName() , RoleID );
        if( HeadTex == null ) return;
        if( this.PlayerTexture == null ) return;
        this.PlayerTexture.spriteFrame = new cc.SpriteFrame(HeadTex);
        
    }

    //微信名字
    public RefreshName( RoleID : number)
    { 
        let SelfID : number = PlayerDataModule.GetPID();
        if( !Util.Equal64Num( SelfID , RoleID ) ) return;
        let WxName = HeadPoolModule.GetWxName( PlayerDataModule.GetUserName() , RoleID);
        if( WxName == null ) return;
        if( this.PlayerName == null ) return;
        this.PlayerName.string = WxName;
    }

    // 微信名字回调
    public NotifiRefreshName( Message )
    {   
        let RoleID = Message.detail;
        let SelfID : number = PlayerDataModule.GetPID();
        if( !Util.Equal64Num( SelfID , RoleID ) ) return;
        let WxName = HeadPoolModule.GetWxName( PlayerDataModule.GetUserName() , RoleID);
        if( WxName == null ) return;
        if( this.PlayerName == null ) return;
        this.PlayerName.string = WxName;
    }

    // 道具
    public RefreshItem()
    {
        this.TxtBaoDou.string  = ItemModule.GetItemCount(5009002).toString();
        this.TxtZuanShi.string = ItemModule.GetItemCount(5009001).toString();
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////
}
