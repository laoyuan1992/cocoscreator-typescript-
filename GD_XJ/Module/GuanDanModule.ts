import Singleton from "../../Common/Function/Singleton";
import EventName from "../../Common/Event/EventName";
import NetManager from "../../Common/Net/NetManager";
import SceneManager from "../../Scene/SceneManager";
import ResourcesManager from "../../Framework/ResourcesManager";
import UIManager from "../../Common/UI/UIManager";
import GameDefine from "./GameDefine";

class GuanDanModule extends Singleton
{
    public GuanDanRoomData : any = null;
    public Init()
    {
        cc.systemEvent.on( EventName.EVENT_DO_LOAD_SCENE_COMPLETE  , this.OnLoadSceneComplete      , this  );
        cc.systemEvent.on( "GD_GI"                                 , this.DoRevcRoomInfo           , this  );//房间信息
        cc.systemEvent.on( "GD_RECGAMEINFO"                        , this.DoRevcRoomInfoAgain      , this  );//重新接收房间信息
        cc.systemEvent.on( "LR"                                    , this.RevcLeaveGame            , this  );//离开游戏
        cc.systemEvent.on( "GD_RS_EG"                              , this.DoRevcLoadFinish         , this  );//加载场景完成
        cc.systemEvent.on( "GD_RDY"                                , this.DoRevcUserReady          , this  );//玩家准备
        cc.systemEvent.on( "GD_CRDY"                               , this.DoRevcUserCancelReady    , this  );//玩家取消准备
        cc.systemEvent.on( "GD_OC"                                 , this.DoRevcOutCard            , this  );//接收玩家出牌
        cc.systemEvent.on( "GD_PS"                                 , this.DoRevcPassCard           , this  );//过牌信息
        cc.systemEvent.on( "GD_SD"                                 , this.DoRevcShowDown           , this  );//结算
        cc.systemEvent.on( "GD_END"                                , this.DoRevcEnd                , this  );//大结算
        cc.systemEvent.on( "GD_RANK"                               , this.DoRevcRoomRank           , this  );//名次信息
        cc.systemEvent.on( "GD_RSTG"                               , this.DoRevcKangGong           , this  );//抗贡
        cc.systemEvent.on( "GD_JF"                                 , this.DoRevcJieFeang           , this  );//接风
        cc.systemEvent.on( "GD_NAID"                               , this.DoRevcNewActionID        , this  );//新玩家ID
        cc.systemEvent.on( "GD_ORE"                                , this.DoRecvDissApply          , this  );//解散申请
        cc.systemEvent.on( "GD_NRE"                                , this.DoRecvRefuseDiss         , this  );//拒绝解散
        cc.systemEvent.on( "GD_SGR"                                , this.DoRecvEnterSendGift      , this  );//进入进贡状态
        cc.systemEvent.on( "GD_SGF"                                , this.DoRecvSendGiftFinish     , this  );//进贡完成
        cc.systemEvent.on( "GD_RGR"                                , this.DoRecvEnterRecvGift      , this  );//进入回贡状态
        cc.systemEvent.on( "GD_RGF"                                , this.DoRecvRecvGiftFinish     , this  );//回贡完成
        cc.systemEvent.on( "GD_SGC"                                , this.DoRevcLimitStartGame     , this  );//同一IP提醒
        cc.systemEvent.on( "GD_RS"                                 , this.DORevcOfflineeState      , this  );//在离线状态
    }

    //房间信息
    private DoRevcRoomInfo( Stream )
    {
        let ProtoBuf  = NetManager.GetProtobuf();
        this.GuanDanRoomData = Stream.detail.msg.ReadProtoBuf( ProtoBuf.MsgGuandanRoom );
        if ( SceneManager.GetCurScene() != "Game" && UIManager.GetUI( GameDefine.GameUIConfig.UI_GAME.type) == null )
        {
            this.LoadGameScene();   
        }else
        {
            cc.systemEvent.emit("SCENE_GD_GI" ,  this.GuanDanRoomData);
        }
    }

    private DoRevcRoomInfoAgain( Stream )
    {
        let ProtoBuf  = NetManager.GetProtobuf();
        this.GuanDanRoomData = Stream.detail.msg.ReadProtoBuf( ProtoBuf.MsgGuandanRoom );
        if ( SceneManager.GetCurScene() != "Game" && UIManager.GetUI( GameDefine.GameUIConfig.UI_GAME.type) == null )
        {
            this.LoadGameScene();   
        }else
        {
            cc.systemEvent.emit("SCENE_GD_RECGAMEINFO" , this.GuanDanRoomData);
        }
    }

    private RevcLeaveGame( Stream )
    {
        let ProtoBuf  = NetManager.GetProtobuf();
        let Msg = Stream.detail.msg.ReadProtoBuf( ProtoBuf.MsgInt );
        cc.systemEvent.emit("SCENE_LR" , Msg );
    }

    private DoRevcLoadFinish()
    {
        cc.systemEvent.emit("SCENE_GD_RS_EG");
    }

    private DoRevcUserReady( Stream )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let Msg = Stream.detail.msg.ReadProtoBuf( ProtoBuf.MsgInt );
        cc.systemEvent.emit( "SCENE_GD_RDY" , Msg );
    }

    private DoRevcUserCancelReady( Stream )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let Msg = Stream.detail.msg.ReadProtoBuf( ProtoBuf.MsgInt );
        cc.systemEvent.emit( "SCENE_GD_CRDY" , Msg );
    }
    
    //接收玩家出牌
    private DoRevcOutCard( Stream )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let OutCard = Stream.detail.msg.ReadProtoBuf( ProtoBuf.MsgUserOutCard );
        cc.systemEvent.emit( "SCENE_GD_OC" , OutCard );
    }

    private DoRevcPassCard( Stream )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let Msg = Stream.detail.msg.ReadProtoBuf( ProtoBuf.MsgActon );
        cc.systemEvent.emit( "SCENE_GD_PS" , Msg );
    }

    private DoRevcShowDown( Stream )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let Msg = Stream.detail.msg.ReadProtoBuf( ProtoBuf.MsgGuanDanShowDown );
        cc.systemEvent.emit( "SCENE_GD_SD" , Msg );
    }

     //大结算
     private DoRevcEnd( Stream )
     {
         let ProtoBuf = NetManager.GetProtobuf();
         let Msg = Stream.detail.msg.ReadProtoBuf( ProtoBuf.MsgGuanDanShowDown );
         cc.systemEvent.emit( "SCENE_GD_END" , Msg );
    }

    private DoRevcKangGong( Stream )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let Msg = Stream.detail.msg.ReadProtoBuf( ProtoBuf.MsgGuanDanResistGift );
        cc.systemEvent.emit( "SCENE_GD_RSTG" , Msg );
    }

    //接风
    private DoRevcJieFeang( Stream )
    {

    }

    //新玩家ID
    private DoRevcNewActionID( Stream )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let Msg = Stream.detail.msg.ReadProtoBuf( ProtoBuf.MsgActon );
        cc.systemEvent.emit( "SCENE_GD_NAID" , Msg );
    }

     //解散申请
    private DoRecvDissApply( Stream )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let Msg = Stream.detail.msg.ReadProtoBuf( ProtoBuf.MsgRoleStateCount );
        cc.systemEvent.emit( "SCENE_GD_ORE" , Msg );
    }

    //拒绝解散
    private DoRecvRefuseDiss( Stream )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let Msg = Stream.detail.msg.ReadProtoBuf( ProtoBuf.MsgInt );
        cc.systemEvent.emit( "SCENE_GD_NRE" , Msg );
    }

    //进入进贡状态
    private DoRecvEnterSendGift( Stream )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let Msg = Stream.detail.msg.ReadProtoBuf( ProtoBuf.MsgGiftRoleCount );
        cc.systemEvent.emit( "SCENE_GD_SGR" , Msg );
    }

    //进贡完成
    private DoRecvSendGiftFinish( Stream )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let Msg = Stream.detail.msg.ReadProtoBuf( ProtoBuf.MsgGuandanRoom );
        cc.systemEvent.emit( "SCENE_GD_SGF" , Msg );
    }

    //进入回贡状态
    private DoRecvEnterRecvGift( Stream )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let Msg = Stream.detail.msg.ReadProtoBuf( ProtoBuf.MsgGiftRoleCount );
        cc.systemEvent.emit( "SCENE_GD_RGR" , Msg );
    }

    //回贡完成
    private DoRecvRecvGiftFinish( Stream )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let Msg = Stream.detail.msg.ReadProtoBuf( ProtoBuf.MsgGuandanRoom );
        cc.systemEvent.emit( "SCENE_GD_RGF" , Msg );
    }

    //同一IP提醒
    private DoRevcLimitStartGame( Stream )
    {
    }

    //在离线状态
    private DORevcOfflineeState( Stream )
    {

    }

    //名次信息
    private DoRevcRoomRank( Stream )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let Msg = Stream.detail.msg.ReadProtoBuf( ProtoBuf.MsgGuanDanRanking );
        cc.systemEvent.emit( "SCENE_GD_RANK" , Msg );
        
    }

    private OnLoadSceneComplete( Param : any )
    {
        if ( Param.detail.file != "Game" ) return;
        let Canvas = cc.find("Canvas");
        Canvas.addComponent("GuanDanScenes");
        UIManager.ShowGameUI( GameDefine.GameUIConfig.UI_GAME );
    }

    private LoadGameScene()
    {
        ResourcesManager.LoadAllResources( "GD_XJ" ,() =>
        {
            SceneManager.LoadScene("Game");
        });
    }

    public OnRelease()
    {
        cc.systemEvent.off( EventName.EVENT_DO_LOAD_SCENE_COMPLETE  , this.OnLoadSceneComplete      , this  );
        cc.systemEvent.off( "GD_GI"                                 , this.DoRevcRoomInfo           , this  );//房间信息
        cc.systemEvent.off( "GD_RECGAMEINFO"                        , this.DoRevcRoomInfoAgain      , this  );//重新接收房间信息
        cc.systemEvent.off( "LR"                                    , this.RevcLeaveGame            , this  );//离开游戏
        cc.systemEvent.off( "GD_RS_EG"                              , this.DoRevcLoadFinish         , this  );//加载场景完成
        cc.systemEvent.off( "GD_RDY"                                , this.DoRevcUserReady          , this  );//玩家准备
        cc.systemEvent.off( "GD_CRDY"                               , this.DoRevcUserCancelReady    , this  );//玩家取消准备
        cc.systemEvent.off( "GD_OC"                                 , this.DoRevcOutCard            , this  );//接收玩家出牌
        cc.systemEvent.off( "GD_PS"                                 , this.DoRevcPassCard           , this  );//过牌信息
        cc.systemEvent.off( "GD_SD"                                 , this.DoRevcShowDown           , this  );//结算
        cc.systemEvent.off( "GD_END"                                , this.DoRevcEnd                , this  );//大结算
        cc.systemEvent.off( "GD_RANK"                               , this.DoRevcRoomRank           , this  );//名次信息
        cc.systemEvent.off( "GD_RSTG"                               , this.DoRevcKangGong           , this  );//抗贡
        cc.systemEvent.off( "GD_JF"                                 , this.DoRevcJieFeang           , this  );//接风
        cc.systemEvent.off( "GD_NAID"                               , this.DoRevcNewActionID        , this  );//新玩家ID
        cc.systemEvent.off( "GD_ORE"                                , this.DoRecvDissApply          , this  );//解散申请
        cc.systemEvent.off( "GD_NRE"                                , this.DoRecvRefuseDiss         , this  );//拒绝解散
        cc.systemEvent.off( "GD_SGR"                                , this.DoRecvEnterSendGift      , this  );//进入进贡状态
        cc.systemEvent.off( "GD_SGF"                                , this.DoRecvSendGiftFinish     , this  );//进贡完成
        cc.systemEvent.off( "GD_RGR"                                , this.DoRecvEnterRecvGift      , this  );//进入回贡状态
        cc.systemEvent.off( "GD_RGF"                                , this.DoRecvRecvGiftFinish     , this  );//回贡完成
        cc.systemEvent.off( "GD_SGC"                                , this.DoRevcLimitStartGame     , this  );//同一IP提醒
        cc.systemEvent.off( "GD_RS"                                 , this.DORevcOfflineeState      , this  );//在离线状态
    }

}

export default GuanDanModule.GetInstance();