import UIBase from "../../Common/UI/UIBase";
import GameDefine from "../Module/GameDefine";
import UIManager from "../../Common/UI/UIManager";
import LinkedList from "../../Common/DataStruct/LinkedList";
import PrivateRoomModule from "../../PrivateRoom/Model/PrivateRoomModule";
import PlayerDataModule from "../../Player/Model/PlayerDataModule";
import OtherPlayerModule from "../../OtherPlayer/Model/OtherPlayerModule";
import GuanDanScenes from "../Module/GuanDanScenes";
import StringHelper from "../../Utility/StringHelper";
import EventName from "../../Common/Event/EventName";
import HeadPoolModule from "../../HeadPool/Model/HeadPoolModule";
import UIGameDistanceCell from "./UIGameDistanceCell";
import LSModule from "../../LService/Model/LSModule";
import ItemPrototype from "../../Config/ItemPrototype";
import ResourcesManager from "../../Framework/ResourcesManager";
import NetManager from "../../Common/Net/NetManager";
import ItemModule from "../../Item/Model/ItemModule";
import * as UIDefine from "../../Common/UI/UIDefine"
import UIInteractPropCell from "./UIInteractPropCell";
import Util from "../../Utility/Util";
//-------------------------------------------------------------------------------------------------
// 游戏个人信息界面
//-------------------------------------------------------------------------------------------------
const {ccclass, property} = cc._decorator;
@ccclass
export default class UIGamePlayerInfo extends UIBase 
{
    @property(cc.Label)
    TextID :cc.Label            = null;
    @property(cc.Label)
    TextIP :cc.Label            = null;
    @property(cc.Label)
    TextName :cc.Label          = null;
    @property(cc.Sprite)
    ImageHead :cc.Sprite        = null;
    @property(cc.Node)
    NodeMan :cc.Node            = null;
    @property(cc.Node)
    NodeWomen :cc.Node          = null;
    @property(cc.Node)
    GiftGrid :cc.Node          = null;
    @property(UIGameDistanceCell)
    DistanceList : UIGameDistanceCell[]          = [];


    private LookID       = 0;

    start()
    {
        cc.systemEvent.on( EventName.EVENT_UI_REFRESH_HEAD , this.NotifiRefreshHead         , this );
        cc.systemEvent.on( EventName.EVENT_UI_REFRESH_NAME , this.NotifiRefreshName         , this );
        cc.systemEvent.on( EventName.EVENT_UI_UIROPI       , this.NotifiRefreshData         , this );
        cc.systemEvent.on( EventName.EVENT_UI_LOCATION     , this.NotifiRefreshLocaltion    , this );
        
        this.LookID = PlayerDataModule.GetLookID();
        this.RefreshGUI();
        this.OnRefreshInteractProp();
        LSModule.SendOtherRoleLocation();
    }

    onDestroy()
    {
        cc.systemEvent.off( EventName.EVENT_UI_REFRESH_HEAD , this.NotifiRefreshHead        , this );
        cc.systemEvent.off( EventName.EVENT_UI_REFRESH_NAME , this.NotifiRefreshName        , this );
        cc.systemEvent.off( EventName.EVENT_UI_UIROPI       , this.NotifiRefreshData        , this );
        cc.systemEvent.off( EventName.EVENT_UI_LOCATION     , this.NotifiRefreshLocaltion   , this );
    }

    //刷新微信头像
    private NotifiRefreshHead( Message )
    {
        let ID = Message.detail;
        if( !Util.Equal64Num( this.LookID , ID) )return;
        let Player = GuanDanScenes.Instance.GetRolePlayer( ID );
        if( null == Player ) return;
        let Tex :cc.Texture2D = HeadPoolModule.GetWxHead( Player.GetUserName() , Player.GetPID() );
        if( null == Tex )return;
        this.ImageHead.spriteFrame = new cc.SpriteFrame(Tex) ;
    }

    //刷新微信名字
    private NotifiRefreshName( Message )
    {
        let ID = Message.detail;
        if( !Util.Equal64Num( this.LookID , ID) )return;
        let Player = GuanDanScenes.Instance.GetRolePlayer( ID );
        if( null == Player ) return;
        let Name : string = HeadPoolModule.GetWxName( ID );
        if( null == Name )return;
        this.TextName.string = Name;
    }

    //刷新玩家信息
    private NotifiRefreshData( msg )
    {
        this.RefreshGUI();
    }

    //刷新定位信息
    private NotifiRefreshLocaltion()
    {
        let Rolelist = GuanDanScenes.Instance.PlayerIDList;
        if( null == Rolelist ) return;
        let Index = 0;
        Rolelist.ForEach( (item) =>  {
            if( !Util.Equal64Num( item.player_base.pid , this.LookID ) )
            {
                let Diff = LSModule.CalculationDistance( this.LookID , item.player_base.pid )
                let Cell = this.DistanceList[Index];
                Cell.RefreshGUI( item.player_base.pid , Diff );
                Index++;
            }
        } )
    }

    //刷新微信头像
    private RefreshHead( UesrName , PID )
    {
        if( !Util.Equal64Num( this.LookID , PID) )return;
        let Tex :cc.Texture2D = HeadPoolModule.GetWxHead( UesrName , PID );
        if( null == Tex )return;
        this.ImageHead.spriteFrame = new cc.SpriteFrame(Tex);
    }
 
    //刷新微信名字
    private RefreshName( UesrName , PID )
    {
        if( !Util.Equal64Num( this.LookID , PID) )return;
        let Name : string = HeadPoolModule.GetWxName( UesrName , PID );
        if( null == Name )return;
        this.TextName.string = Name;
    }

    //刷新GUI
    private RefreshGUI()
    {
        let OtherData = OtherPlayerModule.GetOtherPlayerData( this.LookID );
        if( OtherData == null ) return;
        let Player = GuanDanScenes.Instance.GetRolePlayer( this.LookID );
        if( null == Player ) return;
        this.TextID.string = OtherData.OtherData.pid.toString();
        this.TextIP.string = StringHelper.IntToIP( OtherData.OtherData.last_ip ); 
        this.RefreshHead( Player.GetUserName , Player.GetPID() );
        this.RefreshName( Player.GetUserName , Player.GetPID() );
        let Sex = HeadPoolModule.GetWxSex(  Player.GetUserName, Player.GetPID() );
        if( null == Sex ) return;
        if( Sex == 1 )
        {
            this.NodeMan.active = true;
        }
        else
        {
            this.NodeWomen.active = true;
        }
    }

    //刷新礼物面板
    private OnRefreshInteractProp()
    {
        for(let i = 0 ; i < GameDefine.InteractItem.length ; i++)
        {
            let ItemData = ItemPrototype.GetRowData( GameDefine.InteractItem[i] );
            if( ItemData == null ) return;
            let Path = GameDefine.PrefabPath + "ButtonInteractPropCell";
            let Obj:cc.Node = ResourcesManager.LoadPrefab( Path , this.GiftGrid );
            if( Obj == null ) return;
            let Cell : UIInteractPropCell = Obj.getComponent("UIInteractPropCell");
            if( Cell == null ) return;
            Cell.RefreshGUI(GameDefine.InteractItem[i]);
        }
    }

    //关闭界面
    private OnClickClose()
    {
        this.PlayButtonAudio();
        UIManager.DestroyUI(GameDefine.GameUIConfig.UI_GAMEPLAYERINFO.type)
    }

}