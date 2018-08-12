import Singleton from "../../Common/Function/Singleton";
import NetManager from "../../Common/Net/NetManager";
import RecordGuanDanScenes from "./RecordGuanDanScenes";
import SceneManager from "../../Scene/SceneManager";
import ResourcesManager from "../../Framework/ResourcesManager";
import EventName from "../../Common/Event/EventName";
import UIManager from "../../Common/UI/UIManager";
import GameDefine from "./GameDefine";

enum playState
{
    stop,
    play,
    FastForward,
}

class RecordGuandanNode extends Singleton
{

    private mRecordNodeIdx :number      = 0;        //节点的索引
    private mRecordNodeList             = null;
    private mPlayState :playState       = playState.stop;
    private mTimeID :number             = -1;
    private mRoomData                   = null;


    public Init()
    {
        cc.systemEvent.on( "GD_RD_FD" , this.PlayRecord , this );
        cc.systemEvent.on( EventName.EVENT_DO_LOAD_SCENE_COMPLETE  , this.OnLoadSceneComplete      , this  );
    }

    public OnRelease()
    {
        this.StopRecord();
        cc.systemEvent.off( "GD_RD_FD" , this.PlayRecord , this );
        cc.systemEvent.off( EventName.EVENT_DO_LOAD_SCENE_COMPLETE  , this.OnLoadSceneComplete      , this  );
        this.mRecordNodeIdx = 0;
        this.mRecordNodeList = null;
        this.mPlayState = playState.stop;
    }

    //收到数据开始播放
    private ParseRecordNodeList( RecordNodeList )
    {
        if( null == RecordNodeList ) return;
        this.mRecordNodeList = RecordNodeList.record_node_list.next_node;
        this.ExecuteRecrordNodeRun();
    }

    //执行游戏开始
    private ExecuteRecrordNodeRun()
    {
        if( this.mRecordNodeIdx > this.mRecordNodeList.length ) return;
        let mNode = this.mRecordNodeList[this.mRecordNodeIdx];
        if( null == mNode )  return;
        let ProtoBuf = NetManager.GetProtobuf(); 
        if( mNode.cmd_id == ProtoBuf.TMahJonGCmdRecord.ACTION_START_GAME ) 
        {
            this.ParseGameStart( mNode );
        }
        else if( mNode.cmd_id == ProtoBuf.TMahJonGCmdRecord.ACTION_SEND_FLOWER_CARD )
        {
            this.ParseSendGiftFinish( mNode );
        }
        else if( mNode.cmd_id == ProtoBuf.TMahJonGCmdRecord.ACTION_START_FLOWER_CARD )
        {
            this.ParseRecvGiftFinish( mNode );   
        }
        else if( mNode.cmd_id == ProtoBuf.TMahJonGCmdRecord.ACTION_CONTRACT )
        {
            this.ParseResistGift( mNode );   
        }
        else if( mNode.cmd_id == ProtoBuf.TMahJonGCmdRecord.ACTION_OUT_CARD )
        {
            this.ParseUserOutCard( mNode );   
        }
        else if( mNode.cmd_id == ProtoBuf.TMahJonGCmdRecord.ACTION_SHOWDOWN )
        {
            this.ParseUserShowDown( mNode ,true );   
        }
        this.mRecordNodeIdx++;
    }

    //开始游戏，加载场景，UI
    private ParseGameStart( mNode )
    {
        if( mNode != null )
        {
            this.mRoomData = mNode;
        }
        this.mPlayState = playState.play;
        this.LoadGameScene();   
    }

    public OnLoadSceneComplete(  Param : any ) 
    {
        if ( Param.detail.file != "Record" ) return;
        let Canvas = cc.find("Canvas");
        let Scene =  Canvas.addComponent("RecordGuanDanScenes");
        if(this.mRoomData == null ) return;
        Scene.InitRoomData( this.mRoomData );
        UIManager.ShowGameUI( GameDefine.GameUIConfig.UI_RECORDGAME );
    }

    private LoadGameScene()
    {
        ResourcesManager.LoadAllResources( "GD_XJ" ,() =>
        {
            SceneManager.LoadScene("Record");
        });
    }

    //进贡结束
    private ParseSendGiftFinish( mNode )
    {
        if( mNode.showdown_list.length < 0 ) return;
        if( mNode.showdown_list[0].event.length < 0 ) return;

        let ProtoBuf = NetManager.GetProtobuf();
        let GiftInfo = new ProtoBuf.MsgGiftCardInfo();
        GiftInfo.scr_role_id = mNode.showdown_list[0].param2
        GiftInfo.tar_role_id = mNode.showdown_list[0].param1;
        let MsgCardInfo   = new ProtoBuf.MsgCardInfo();
        MsgCardInfo.card  = mNode.showdown_list[0].event[0].event_id;
        MsgCardInfo.index = mNode.showdown_list[0].event[0].count;
        GiftInfo.send_card = MsgCardInfo;
        cc.systemEvent.emit( "GD_JH_GG" , GiftInfo );
    }

    //回贡结束
    private ParseRecvGiftFinish( mNode )
    {
        if( mNode.showdown_list.length < 0 ) return;
        if( mNode.showdown_list[0].event.length < 0 ) return;
        let ProtoBuf = NetManager.GetProtobuf();
        let GiftInfo = new ProtoBuf.MsgGiftCardInfo();
        GiftInfo.scr_role_id = mNode.showdown_list[0].param2
        GiftInfo.tar_role_id = mNode.showdown_list[0].param1;
        let MsgCardInfo   = new ProtoBuf.MsgCardInfo();
        MsgCardInfo.card  = mNode.showdown_list[0].event[0].event_id;
        MsgCardInfo.index = mNode.showdown_list[0].event[0].count;
        GiftInfo.send_card = MsgCardInfo;
        RecordGuanDanScenes.Instance.DoRecvRecvGiftFinish(GiftInfo)
    }

    //抗贡
    private ParseResistGift( mNode )
    {
        cc.systemEvent.emit( "GD_JH_RG" );
    }

    //出牌
    private ParseUserOutCard( mNode )
    {
        let ProtoBuf            = NetManager.GetProtobuf();
        let MsgOutCard          = new ProtoBuf.MsgUserOutCard();
        MsgOutCard.old_actionid = mNode.action_id;
        MsgOutCard.out_kind     = mNode.card_index;
        MsgOutCard.new_actionid = mNode.target_id;
        MsgOutCard.wik          = mNode.action_wik;

        for( let i = 0 ; i < mNode.card_value.length ; i++ )
        {
            let card = mNode.card_value[i];
            let MsgCardInfo = new ProtoBuf.MsgCardInfo();
            MsgCardInfo.card = card;
            MsgOutCard.out_card.push(MsgCardInfo);
        }
        if( mNode.card_value.length == 0 )
        {
            cc.systemEvent.emit( "GD_RN_OT" , mNode.action_id );
        }
        else
        {
            RecordGuanDanScenes.Instance.DoRevcOutCard(MsgOutCard);
        }
    }

    //结算
    private ParseUserShowDown( mNode , Stop )
    {
        let ProtoBuf                    = NetManager.GetProtobuf();
        let MsgGuanDanShowDown          = new ProtoBuf.MsgGuanDanShowDown();
        //赢家
        for( let i = 0 ; i < mNode.win_role.length ; i++ )
        {
            let RoleInfo            = new ProtoBuf.MsgShowDownRole();
            let MsgWinRole          = mNode.win_role[i];
            RoleInfo.score          = MsgWinRole.score;
            RoleInfo.role_id        = MsgWinRole.role_id;
            RoleInfo.series         = MsgWinRole.series;
            RoleInfo.current_score  = MsgWinRole.current_score;
            MsgGuanDanShowDown.win_role.push(RoleInfo);
        }

        //输家
        for( let i = 0 ; i < mNode.lost_role.length ; i++ )
        {
            let RoleInfo            = new ProtoBuf.MsgShowDownRole();
            let MsgLostRole         = mNode.lost_role[i];
            RoleInfo.score          = MsgLostRole.score;
            RoleInfo.role_id        = MsgLostRole.role_id;
            RoleInfo.series         = MsgLostRole.series;
            RoleInfo.current_score  = MsgLostRole.current_score;
            MsgGuanDanShowDown.lost_role.push(RoleInfo);
        }

        //排名
        MsgGuanDanShowDown.room_ranking = new ProtoBuf.MsgGuanDanRanking();
        for ( let i = 0 ; i < mNode.room_ranking.rank_list.length ; i++ )
        {
            MsgGuanDanShowDown.room_ranking.rank_list.push(mNode.room_ranking.rank_list[i]) ;
        }

        //其他
        MsgGuanDanShowDown.one_game_over = mNode.card_index;
        MsgGuanDanShowDown.three_times_up = parseInt(mNode.action_id);
        MsgGuanDanShowDown.relieve_state = mNode.action_wik;
        if( mNode.showdown_list.length > 0 )
        {
            MsgGuanDanShowDown.series_inc = parseInt(mNode.showdown_list[0].param5);
        }

        //发请求
        RecordGuanDanScenes.Instance.DoRevcShowDown(MsgGuanDanShowDown);
        //停止播放
        if( Stop )
        {
            this.StopRecord();
            cc.systemEvent.emit( "RE_ST" );
        }
    }

    public GetRecordShowDownInfo()
    {
        let SDNode = this.SelectShowDownNode();
        this.ParseUserShowDown( SDNode, false );
    }

    private SelectShowDownNode()
    {
        let ProtoBuf                    = NetManager.GetProtobuf();
        let mNode = null;
        for( let i = this.mRecordNodeList.length - 1 ; i >= 0 ; i-- )
        {
            mNode = this.mRecordNodeList[i];
            if( mNode == null ) return null;
            if( mNode.cmd_id == ProtoBuf.TMahJonGCmdRecord.ACTION_SHOWDOWN )
            {
                return mNode;
            }
        }
        return null;
    }

    //判断是否播放
    public RecordPlayOrStop()
    {
        if(this.mPlayState == playState.FastForward || this.mPlayState == playState.play)
        {
            this.mPlayState = playState.stop;
            this.StopRecord();
            return false;
        }
        this.mPlayState = playState.play;
        this.StopRecord
        this.StartTimerEvent(1);
        return true;
    }

    //快进
    public RecordPlaySpeed()
    {
        if( this.mPlayState == playState.stop )
        {
            return;
        }
        else if( this.mPlayState == playState.play )
        {
            this.mPlayState = playState.FastForward;
            this.StopRecord();
            this.StartTimerEvent( 0.5 );
        }
        else if( this.mPlayState == playState.FastForward )
        {
            this.ExecuteRecrordNodeRun();
        }
    }

    private PlayRecord()
    {
        this.StopTimerEvent();
        this.StartTimerEvent( 1 );
    }

    private StopRecord()
    {
        this.StopTimerEvent();
    }

    //开始计时器方法
    private StartTimerEvent( duration )
    {
        if( null == this.mTimeID )
        {
            this.mTimeID = setInterval( () => {
                this.ExecuteRecrordNodeRun();
            },duration*1000 );
        }
    }

    //停止计时器
    private StopTimerEvent()
    {
        if( null != this.mTimeID)
        {
            clearInterval(this.mTimeID);
            this.mTimeID = null;
        }
    }

    //播放前要清理的数据
    private ClearRecordNodeList()
    {
        this.mRecordNodeIdx  = 0;
        this.mRecordNodeList = null;
    }

    //重新播放
    private RePlayRecord()
    {
        if( null == this.mRecordNodeList ) return;
        this.StopTimerEvent();
        this.mRecordNodeIdx = 0;
        this.ExecuteRecrordNodeRun();
    }
}
export default RecordGuandanNode.GetInstance()