import UIBase from "../../Common/UI/UIBase";
import UIRecordPeopleInfo from "./UIRecordPeopleInfo";
import LinkedList from "../../Common/DataStruct/LinkedList";
import RecordModule from "../Model/RecordModule";

//-------------------------------------------------------------------------------------------------
// 回放详情Cell
//-------------------------------------------------------------------------------------------------
const {ccclass, property} = cc._decorator;
@ccclass
export default class UIBattleRecordDetailedCell extends UIBase
{
    @property(cc.Label)
    TextGameType :cc.Label              = null;             //房间号
    @property(cc.Label)
    TextGameCount :cc.Label             = null;             //把数
    @property(UIRecordPeopleInfo)
    People1 :UIRecordPeopleInfo         = null;
    @property(UIRecordPeopleInfo)
    People2 :UIRecordPeopleInfo         = null;
    @property(UIRecordPeopleInfo)
    People3 :UIRecordPeopleInfo         = null;
    @property(UIRecordPeopleInfo)
    People4 :UIRecordPeopleInfo         = null;

    private mPeopleList :LinkedList     = new LinkedList();
    private mRecordData :any            = null
    private mGameCount : number          = -1;
    
    onLoad()
    {
        this.mPeopleList.Push(this.People1);
        this.mPeopleList.Push(this.People2);
        this.mPeopleList.Push(this.People3);
        this.mPeopleList.Push(this.People4);
    }

    //刷新房间信息
    public RefreshRoomData( idx:number , RoomType:string , GameCount:number )
    {
        let StringCount = "";
        if(RoomType == "GD_XJ")
        {
            StringCount = "把";
            this.TextGameType.string = "掼蛋";
        }
        this.TextGameCount.string = idx + "/" + GameCount + StringCount;
    }

    //刷新玩家
    public RefreshPlayers( RecordDetailed , idx )
    {
        this.mGameCount = idx;
        for( let i = 0 ; i < RecordDetailed.score_count[idx].score_list.length ; i++)
        {
            let Score       = RecordDetailed.score_count[idx].score_list[i].score;
            let UserName    = RecordDetailed.name_count[idx].name_list[i].name;
            let PID         = RecordDetailed.name_count[idx].name_list[i].pid;
            this.mPeopleList.Get(i+1).RefreshGUI( UserName , PID , Score );
        }
    }

    //查看房间战绩
    private OnClickChaKan()
    {
        let Data = RecordModule.LookRecordData;
        Data.GameCount = this.mGameCount;
        RecordModule.SendRecordNodeInfo( Data );
    }
}
