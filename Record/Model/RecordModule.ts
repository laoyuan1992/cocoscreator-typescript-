import Singleton from "../../Common/Function/Singleton";
import LinkedList from "../../Common/DataStruct/LinkedList";
import EventName from "../../Common/Event/EventName";
import NetManager from "../../Common/Net/NetManager";
import RecordGuanDanNode from "../../GD_XJ/Module/RecordGuanDanNode";
import PlayerDataModule from "../../Player/Model/PlayerDataModule";
import TimeHelper from "../../Utility/TimeHelper";
import UIManager from "../../Common/UI/UIManager";
import { UIType } from "../../Common/UI/UIDefine";
import ChrysanthemumModule from "../../Chrysanthemum/Model/ChrysanthemumModule";

class LookRecordData 
{
    public RecordID  : number = 0; // 战绩
    public GameCount : number = 0; // 当前把数
    public RoomID    : number = 0; // 房间ID
    public RoomType  : string = "";// 房间类型
    public GameTime  : string = "";// 本局时间
}

class RecordModule extends Singleton 
{
    private mRecordList      : LinkedList    = new LinkedList();
    private mRecordCount     : number        = 0;
    private mRecordVersion   : number        = 0;
    private mRecordDetailed  : any           = null; 
    private mRecordNode      : any           = null;
    private mCurrRecord      : any           = null;
    private mLookRecordData :LookRecordData = new LookRecordData();

    public Init()
    {
        cc.systemEvent.on(EventName.NET_DO_GET_RECORD_INFO, this.RevcRecordInfo , this );
        cc.systemEvent.on(EventName.NET_DO_GET_RECORD_DETAILED_INFO, this.RevcRecordDetailedInfo , this );
        cc.systemEvent.on(EventName.NET_DO_GET_RECORD_NODE_INFO, this.RevcRecordNodeList , this );
        cc.systemEvent.on(EventName.EVENT_DO_AUTO_OTHER_RECORD, this.RequestOtherPlayerRecord , this );
    }

    // 获得战绩列表;
    public GetRecordList()
    {
        return this.mRecordList;
    }

    //设置当前操作的战绩
    public SetCurrRecord( RecordData )
    {
        this.mCurrRecord = RecordData;
    }

    //获得当前操作的战绩
    public GetCurrRecord()
    {
        return this.mCurrRecord;
    }

    //获取战绩的详细信息
    public GetRecordDetailed()
    {
        return this.mRecordDetailed;
    }
    
    // 战绩信息
    private RevcRecordInfo( Stream )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let msg = Stream.detail.msg.ReadProtoBuf( ProtoBuf.MsgFightingRecordCount );
        if( msg == null ) return;
        this.ClearRecordCache();
        for( let idx = 0 ; idx < msg.recordlist.length ; idx++)
        {
            this.mRecordList.Push( msg.recordlist[idx]);
        }
        this.mRecordList.Sort( (a,b) => {
            return parseInt( a.time ) > parseInt( b.time ); 
        } )
        if( this,this.mRecordList.GetCount() != 0 )
        {
            this.mRecordVersion = msg.record_version;
        }
        cc.systemEvent.emit(EventName.EVENT_UI_REFRESH_RECORD_INFO);
    }

    // 单个战斗所有局数信息
    private RevcRecordDetailedInfo( Stream )
    {
        ChrysanthemumModule.CloseChrysanthemum();
        let ProtoBuf = NetManager.GetProtobuf();
        let msg = Stream.detail.msg.ReadProtoBuf( ProtoBuf.MsgRecordScoreCountList );
        this.mRecordDetailed = msg;
        //显示UI
       UIManager.ShowUI(UIType.UI_BATTLE_DETAILED);
       UIManager.DestroyUI(UIType.UI_BATTLE_RECORD);
    }

    // 单局战绩战斗节点
    private RevcRecordNodeList( Stream )
    {
        ChrysanthemumModule.CloseChrysanthemum();
        let ProtoBuf = NetManager.GetProtobuf();
        let msg = Stream.detail.msg.ReadProtoBuf( ProtoBuf.MsgRecordNodeCount );
        this.StartParseRecordNodeList(msg);
    }
    
    private StartParseRecordNodeList( RecordList )
    {
        let RoomType = RecordList.room_type;
        this.mLookRecordData.RoomType = RoomType;
        this.ParseRecordNodeList(RoomType,RecordList);
    }

    
    //根据不同的roomtype 播放回放
    private ParseRecordNodeList( RoomType:string , RecordList :any )
    {
        let GameType = RoomType.split('_');
        if ( GameType.length < 1 )
        {
            console.log("roomtype 类型找不到");
            return; 
        }
        this.ReleaseRecordGameEntity();
        if ( GameType[0] == "GD" )
        {
            this.mRecordNode = RecordGuanDanNode;
        }else
        {
            //其他游戏
        }
        this.mRecordNode.Init();
        this.mRecordNode.ParseRecordNodeList( RecordList );
    }

    private ReleaseRecordGameEntity()
    {
        if( this.mRecordNode != null )
        {
            this.mRecordNode.OnRelease();
        }
        this.mRecordNode = null;
    }

    //请求战绩信息
    public SendRequestRecordInfo()
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let msg = new ProtoBuf.MsgInt();
        msg.value = this.mRecordVersion;
        NetManager.SendMessage( EventName.NET_DO_GET_RECORD_INFO, msg );
    }

    //请求战绩详细信息
    public SendRequestRecordDetailedInfo( RecordID )
    {
        ChrysanthemumModule.ShowChrysanthemum(99);
        let ProtoBuf = NetManager.GetProtobuf();
        let msg = new ProtoBuf.MsgInt();
        msg.value = RecordID;
        NetManager.SendMessage( EventName.NET_DO_GET_RECORD_DETAILED_INFO, msg );
    }

    //请求房间里面的节点
    public SendRecordNodeInfo( RecordData )
    {
        ChrysanthemumModule.ShowChrysanthemum(99);
        let ProtoBuf = NetManager.GetProtobuf();
        let msg = new ProtoBuf.MsgUpdateValue();
        msg.str_1 	= RecordData.RecordID.toString();
        msg.ext32_0 = RecordData.GameCount;
        msg.str_0   = RecordData.RoomType;
        NetManager.SendMessage( EventName.NET_DO_GET_RECORD_NODE_INFO, msg );
    }

    //请求其他玩家战绩
    private RequestOtherPlayerRecord( Stream )
    {
        ChrysanthemumModule.ShowChrysanthemum(99);
    }

    //请求战绩前需要清理下
    private ClearRecordCache()
    {
        this.mRecordList.Clear();
    }

    //设置回放中房间的信息
    public SetRecordRoomData( RecordData )
    {
        this.mLookRecordData.RecordID = RecordData.record_id;
        this.mLookRecordData.RoomID   = RecordData.room_id;
        this.mLookRecordData.RoomType = RecordData.room_type;
	    this.mLookRecordData.GameTime = TimeHelper.getDateAndTimeText( RecordData.time );
    }

    public get RecordList()             : LinkedList        {  return this.mRecordList;          } 
    public get LookRecordData()         : LookRecordData    {  return this.mLookRecordData;      } 
}
export default RecordModule.GetInstance();
