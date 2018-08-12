//-------------------------------------------------------------------------------------------------
// 玩家信息界面
//-------------------------------------------------------------------------------------------------
import UIManager from "../../Common/UI/UIManager"
import * as UIDefines from "../../Common/UI/UIDefine" 
import UIBase from "../../Common/UI/UIBase";
import PlayerDataModule from "../Model/PlayerDataModule";
import HeadPoolModule from "../../HeadPool/Model/HeadPoolModule";
import EventName from "../../Common/Event/EventName";
import StringHelper from "../../Utility/StringHelper";
import LoginAuthAccountModule from "../../Login/Model/LoginAuthAccountModule";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIPlayerInfo extends UIBase 
{
    @property(cc.Button)
    BGClose: cc.Button = null;

    @property(cc.Button)
    BtnClose: cc.Button = null;

    @property(cc.Sprite)
    ImgHead: cc.Sprite = null;

    @property(cc.Label)
    TxtName: cc.Label = null;

    @property(cc.Label)
    TxtIP: cc.Label = null;

    @property(cc.Label)
    TxtID: cc.Label = null;

    @property(cc.Sprite)
    ImgMan: cc.Sprite = null;

    @property(cc.Sprite)
    ImgWoMan: cc.Sprite = null;

    start() 
	{
        cc.systemEvent.on( EventName.EVENT_UI_REFRESH_HEAD , this.NotifiRefreshHead , this );
        cc.systemEvent.on( EventName.EVENT_UI_REFRESH_NAME , this.NotifiRefreshName , this );
        this.RefreshData();
    }

	onDestroy()
    {
        cc.systemEvent.off( EventName.EVENT_UI_REFRESH_HEAD , this.NotifiRefreshHead , this );
        cc.systemEvent.off( EventName.EVENT_UI_REFRESH_NAME , this.NotifiRefreshName , this );
    }

    //刷新数据
    private RefreshData()
    {
        this.TxtID.string = "ID:" + PlayerDataModule.GetPID();
        this.TxtIP.string = "IP:" + LoginAuthAccountModule.GetClientHost();; 
        this.RefreshName( PlayerDataModule.GetPID() );
        this.RefreshHead( PlayerDataModule.GetPID() );
    }

    //刷新名字
    private RefreshName( ID )
    {
        let SelfID = PlayerDataModule.GetPID();
        if( SelfID != ID ) return;
        let WxName = HeadPoolModule.GetWxName( PlayerDataModule.GetUserName() , ID );
        if( WxName == null ) return;
        this.TxtName.string = WxName;
    }

    //刷新头像
    private RefreshHead( ID )
    {
        let SelfID = PlayerDataModule.GetPID();
        if( SelfID != ID ) return;
        let Wxhead = HeadPoolModule.GetWxHead( PlayerDataModule.GetUserName() , ID );
        if( Wxhead == null ) return;
        this.ImgHead.spriteFrame = new cc.SpriteFrame(Wxhead);
    }

    //刷新名字
    private NotifiRefreshName( Message )
    {
        let ID = Message.detail;
        let SelfID = PlayerDataModule.GetPID();
        if( SelfID != ID ) return;
        let WxName = HeadPoolModule.GetWxName( PlayerDataModule.GetUserName() , ID );
        if( WxName == null ) return;
        this.TxtName.string = WxName;
    }

    //刷新头像
    private NotifiRefreshHead( Message )
    {
        let ID = Message.detail;
        let SelfID = PlayerDataModule.GetPID();
        if( SelfID != ID ) return;
        let Wxhead = HeadPoolModule.GetWxHead( PlayerDataModule.GetUserName() , ID );
        if( Wxhead == null ) return;
        this.ImgHead.spriteFrame = new cc.SpriteFrame(Wxhead);
    }
    
    private ClickClose()
    {
        this.PlayButtonAudio();
        UIManager.DestroyUI(UIDefines.UIType.UI_PLAYERINFO);
    }


}
