import UIBase from "../../Common/UI/UIBase";
import UIRecordPeopleInfo from "./UIRecordPeopleInfo";
import LinkedList from "../../Common/DataStruct/LinkedList";
import EventName from "../../Common/Event/EventName";
import RecordModule from "../Model/RecordModule";
import StringHelper from "../../Utility/StringHelper";
import TimeHelper from "../../Utility/TimeHelper";
import UIManager from "../../Common/UI/UIManager";
import { UIType } from "../../Common/UI/UIDefine";

//-------------------------------------------------------------------------------------------------
// 回放Cell界面
//-------------------------------------------------------------------------------------------------
const {ccclass, property} = cc._decorator;
@ccclass
export default class UIBattleRecordCell extends UIBase
{
    @property(cc.Label)
    TextRoomID :cc.Label                = null; 
    @property(cc.Label)
    TextName :cc.Label                  = null; 
    @property(cc.Label)
    TextTime :cc.Label                  = null;
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

    onLoad() 
    {
        this.mPeopleList.Push(this.People1);
        this.mPeopleList.Push(this.People2);
        this.mPeopleList.Push(this.People3);
        this.mPeopleList.Push(this.People4);
    }

    //显示信息
    public ShowInfo(index:number)
    {
        let MsgRecordList:LinkedList = RecordModule.RecordList;
        if (MsgRecordList.GetCount() == 0 || MsgRecordList.GetCount() < index ) return;
        this.mRecordData = MsgRecordList.Get( index );
        if( null == this.mRecordData ) return;
        this.ShowBattleInfo(this.mRecordData);
    }

    //显示战绩的详情
    private ShowBattleInfo( RecordData )
    {
        let RoomID = RecordData.room_id.toString();
        if(RoomID)
        {
            this.TextRoomID.string = StringHelper.PadLeft( RoomID,6,"0");
        }
        this.TextTime.string = TimeHelper.getDateAndTimeText(RecordData.time);
        let People : string[] = RecordData.content.split(";");
        for(let i = 0;i<People.length;i++)
        {
            if ( i > this.mPeopleList.GetCount() ) break;
            let RoleIdTable : string[] = People[i].split("|");
            let ParamTable  : string[] = RoleIdTable[0].split(":");
            if( ParamTable.length == 2 && RoleIdTable.length == 2 )
            {
                let Score = parseInt(RoleIdTable[1]) ;
                this.mPeopleList.Get(i+1).RefreshGUI(ParamTable[0],ParamTable[1] , Score);
            }
        }
    }
    
    //请求详细的战绩信息
    private OnClickCell()
    {
        this.PlayButtonAudio();
        if( this.mRecordData == null ) return;
        RecordModule.SetCurrRecord( this.mRecordData );
        RecordModule.LookRecordData.RecordID     = this.mRecordData.record_id;
        RecordModule.LookRecordData.RoomID     = this.mRecordData.room_id;
        RecordModule.LookRecordData.RoomType     = this.mRecordData.room_type;
        RecordModule.SendRequestRecordDetailedInfo(this.mRecordData.record_id);
    }

}