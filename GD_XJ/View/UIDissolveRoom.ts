import UIBase from "../../Common/UI/UIBase";
import LinkedList from "../../Common/DataStruct/LinkedList";
import RoomDissolveCell from "./RoomDissolveCell";
import TimeHelper from "../../Utility/TimeHelper";
import GuanDanScenes from "../Module/GuanDanScenes";
import GamePlayer from "../Module/GamePlayer";
import Util from "../../Utility/Util";
import PlayerDataModule from "../../Player/Model/PlayerDataModule";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIDissolveRoom extends UIBase {

    @property(cc.Button)
    ButtonRefuse: cc.Button = null;                 //拒绝按钮
    @property(cc.Button)
    ButtonAgreed: cc.Button = null;                 //同意按钮
    @property(cc.Label)
    TextTime: cc.Label = null;                     //时间显示
    @property(cc.Node)
    GridParent: cc.Node = null;                     

    private mCellList  = new LinkedList();
    private mTimeTotal = 0;
    private mColor     = { 1 :　cc.color(255,0,0) , 2 : cc.color(14,107,222)};

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () 
    {
        for (let i = 0 ; i < this.GridParent.childrenCount ; i++)
        {
            let Obj = this.GridParent.children[i];
            let CellGUI = Obj.getComponent( RoomDissolveCell );
            this.mCellList.Push( CellGUI );
        }
        cc.systemEvent.on( "GD_DI_SS"　, this.NotifiRefreshDissMissGUI , this );
        cc.systemEvent.emit( "GD_DI_SS" , 0 );
        this.schedule(this.TimerCallBack,1);
    }

    onDestroy()
    {
        cc.systemEvent.off( "GD_DI_SS"　, this.NotifiRefreshDissMissGUI );
        this.unschedule(this.TimerCallBack);
    }

    private OnClickAgreed()
    {
        this.PlayButtonAudio();
        GuanDanScenes.Instance.SendRequestRelieveRoom( true );
    }

    private OnClickRefuse()
    {
        this.PlayButtonAudio();
        GuanDanScenes.Instance.SendRequestRelieveRoom( false );
    }

    //计时器回调
    private TimerCallBack()
    {
        if( this.mTimeTotal <= 0 )
        {
            this.unschedule(this.TimerCallBack);
            return;
        }
        this.mTimeTotal = this.mTimeTotal - 1;
        this.TextTime.string = TimeHelper.SecondsToString( this.mTimeTotal );
    }

    private NotifiRefreshDissMissGUI( Message )
    {
        let CurStateTime = Message.detail;        
        if( null != CurStateTime )
        {
            if( CurStateTime < 0 )
            {
                CurStateTime = 0;
            }
            this.mTimeTotal = 300 - CurStateTime / 1000;
            this.TextTime.string = TimeHelper.SecondsToString(this.mTimeTotal);
        }
        let PlayerList : LinkedList = GuanDanScenes.Instance.PlayerList;
        let idx = 1;
        PlayerList.ForEach( (item : GamePlayer) => {
            if( null != item )
            {
                let CellGUI : RoomDissolveCell = this.mCellList.Get(idx);
                if( null != CellGUI )
                {
                    CellGUI.RefreshGUI(item , this.mColor);
                }
                if(Util.Equal64Num( item.GetPID() , PlayerDataModule.GetPID() ) )
                {
                    if( item.IsRelieve() )
                    {
                        this.ButtonAgreed.node.active = false;
                        this.ButtonRefuse.node.active = false;
                    }
                }
            }
            idx++;
        })
        
    }

    // update (dt) {}
}
