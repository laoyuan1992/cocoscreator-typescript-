import UIBase from "../../Common/UI/UIBase";
import EventName from "../../Common/Event/EventName";
import PrivateRoomModule from "../Model/PrivateRoomModule";
import NetManager from "../../Common/Net/NetManager";
import RoomCostConfig from "../../Config/RoomCostConfig";
import MessageConfig from "../../Config/MessageConfig";

//-------------------------------------------------------------------------------------------------
// 掼蛋创建房间组件相关逻辑
//-------------------------------------------------------------------------------------------------

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIRoomGDMethod extends UIBase 
{
    // 房主付费
    @property(cc.Toggle)
    ToggleFangzhu :cc.Toggle        = null;
    //大赢家付费
    @property(cc.Toggle)
    ToggleDayingjia :cc.Toggle      = null;
    //AA制付费
    @property(cc.Toggle)
    ToggleAA :cc.Toggle             = null;
    //把数1
    @property(cc.Toggle)
    ToggleGameCount1 :cc.Toggle     = null;
    //把数2
    @property(cc.Toggle)
    ToggleGameCount2 :cc.Toggle     = null;
    //把数3
    @property(cc.Toggle)
    ToggleGameCount3 :cc.Toggle     = null;
    //把数1标题
    @property(cc.Label)
    Toggle1Text :cc.Label           = null;
    //把数2标题
    @property(cc.Label)
    Toggle2Text :cc.Label           = null;
    //把数3标题
    @property(cc.Label)
    Toggle3Text :cc.Label           = null;
    //经典玩法
    @property(cc.Toggle)
    ToggleJDWF :cc.Toggle           = null;
    //团团转玩法
    @property(cc.Toggle)
    ToggleTTZWF :cc.Toggle          = null;
    //固定座位
    @property(cc.Toggle)
    ToggleFixedSeat :cc.Toggle      = null;
    //进贡
    @property(cc.Toggle)
    ToggleGift :cc.Toggle           = null;
    //升4级
    @property(cc.Toggle)
    ToggleUpgrade4 :cc.Toggle       = null;
    //升3级
    @property(cc.Toggle)
    ToggleUpgrade3 :cc.Toggle       = null;
    //不翻倍
    @property(cc.Toggle)
    ToggleNoDouble :cc.Toggle       = null;
    //翻2倍
    @property(cc.Toggle)
    Toggle2Double :cc.Toggle        = null;
    //翻3倍
    @property(cc.Toggle)
    Toggle3Double :cc.Toggle        = null;
    //可选玩法组件
    @property(cc.Node)
    GoKXWanFa :cc.Node              = null;
    //翻倍玩法组件
    @property(cc.Node)
    GoDouble :cc.Node               = null;
    //双下升级组件
    @property(cc.Node)
    GoSXShengJi :cc.Node            = null;
    //创建按钮上的消耗
    @property(cc.Label)
    TextCost :cc.Label             = null;

    private ProtoBuf = NetManager.GetProtobuf();

    start()
    {
        cc.systemEvent.on(EventName.EVENT_UI_CONSUME_REFRESH, this.OnRefreshConsume , this);
        this.RefreshWanFa();
        this.RefreshGameCount();
    }

    onDestroy()
    {
        cc.systemEvent.off(EventName.EVENT_UI_CONSUME_REFRESH, this.OnRefreshConsume , this);
    }

    // 点击付费方式toggle
    private OnClickTogglePayMode( event )
    {
        this.PlayButtonAudio();
        if( event == this.ToggleFangzhu)
        {
            PrivateRoomModule.SetPayMode( this.ProtoBuf.TPaymentMechanism.ROOM_OWNER_OPTION);
        }
        else if( event == this.ToggleAA )
        {
            PrivateRoomModule.SetPayMode(this.ProtoBuf.TPaymentMechanism.AA_SYSTEM_OPTION);
        }
        else if( event == this.ToggleDayingjia )
        {
            PrivateRoomModule.SetPayMode(this.ProtoBuf.TPaymentMechanism.BIG_OWNER_OPTION);
        }
        this.RefreshGameCount();
    }

    //刷新局数
    public RefreshGameCount()
    {
        if(PrivateRoomModule.GetRoomSpecialKind(this.ProtoBuf.TGameGuanDanSpecial.TGDSK_JDWF))
        {
            this.Toggle1Text.string = MessageConfig.GetMessage(1008);
            this.ToggleGameCount2.node.active = false;
            this.ToggleGameCount3.node.active = false;
        }
        else if(PrivateRoomModule.GetRoomSpecialKind(this.ProtoBuf.TGameGuanDanSpecial.TGDSK_TTZWF))
        {
            this.ToggleGameCount2.node.active = true;
            this.ToggleGameCount3.node.active = true;
            this.Toggle1Text.string = RoomCostConfig.GetGameCount(35) + "局";
            this.Toggle2Text.string = RoomCostConfig.GetGameCount(36) + "局";
            this.Toggle3Text.string = RoomCostConfig.GetGameCount(37) + "局";
        }
    }

    //创建房间
    private OnClickCreateRoom()
    {
        this.PlayButtonAudio();
        PrivateRoomModule.CreateRoom();
    }

    //刷新房间消耗
    public OnRefreshConsume( Message )
    {
        this.TextCost.string = Message.detail;
    }

    //游戏规则
    private OnClickGameHelp()
    {
        this.PlayButtonAudio();
        PrivateRoomModule.CreatGameRule();
    }

    //刷新玩法显示
    public RefreshWanFaVisible()
    {
        if( PrivateRoomModule.GetRoomSpecialKind(this.ProtoBuf.TGameGuanDanSpecial.TGDSK_JDWF) )
        {
            this.GoKXWanFa.active = true;
            this.GoDouble.active = true;
            this.GoSXShengJi.active = true;
        }
        else if( PrivateRoomModule.GetRoomSpecialKind(this.ProtoBuf.TGameGuanDanSpecial.TGDSK_TTZWF) )
        {
            this.GoKXWanFa.active = false;
            this.GoDouble.active = false;
            this.GoSXShengJi.active = false;
        }
    }

    //点击游戏把数
    private OnClickToggleGameCount( event )
    {
        this.PlayButtonAudio();
        if( event == this.ToggleGameCount1 )
        {
            if(PrivateRoomModule.GetRoomSpecialKind(this.ProtoBuf.TGameGuanDanSpecial.TGDSK_JDWF))
            {
                PrivateRoomModule.SetConsumeID( 34 );
            }
            else
            {
                PrivateRoomModule.SetConsumeID( 35 );
            }
        } 
        else if( event == this.ToggleGameCount2 )
        {
            if(PrivateRoomModule.GetRoomSpecialKind(this.ProtoBuf.TGameGuanDanSpecial.TGDSK_JDWF))
            {
                PrivateRoomModule.SetConsumeID( 34 );
            }
            else
            {
                PrivateRoomModule.SetConsumeID( 36 );
            }
        }
        else if( event == this.ToggleGameCount3 )
        {
            if(PrivateRoomModule.GetRoomSpecialKind(this.ProtoBuf.TGameGuanDanSpecial.TGDSK_JDWF))
            {
                PrivateRoomModule.SetConsumeID( 34 );
            }
            else
            {
                PrivateRoomModule.SetConsumeID( 37 );
            }
        }
    }

    //点击游戏类型
    private OnClickToggleGameType( event )
    {
        this.PlayButtonAudio();
        this.ResetData();
        if( event == this.ToggleJDWF )
        {
            PrivateRoomModule.SetRoomSpecialKind(true,this.ProtoBuf.TGameGuanDanSpecial.TGDSK_JDWF);
            PrivateRoomModule.SetRoomSpecialKind(false,this.ProtoBuf.TGameGuanDanSpecial.TGDSK_TTZWF);
            PrivateRoomModule.SetRoomSpecialKind(true,this.ProtoBuf.TGameGuanDanSpecial.TGDSK_QA);
        }
        else if( event == this.ToggleTTZWF )
        {
            PrivateRoomModule.SetRoomSpecialKind(false,this.ProtoBuf.TGameGuanDanSpecial.TGDSK_JDWF);
            PrivateRoomModule.SetRoomSpecialKind(true,this.ProtoBuf.TGameGuanDanSpecial.TGDSK_TTZWF);
            PrivateRoomModule.SetRoomSpecialKind(false,this.ProtoBuf.TGameGuanDanSpecial.TGDSK_QA);
        }
        this.ToggleGift.isChecked       = true;             //默认进贡
        this.ToggleFixedSeat.isChecked  = false;            //默认不固定座位
        this.ToggleNoDouble.isChecked   = true;             //默认升4级
        this.ToggleNoDouble.isChecked   = true;             //默认无翻倍
        this.ToggleGameCount1.isChecked = true;             //默认选中第一个局数Toggle
        this.RefreshGameCount();
        this.SetDefaultCostID();
        this.RefreshWanFaVisible();   
    }

    //点击是否进贡
    private OnClickToggleGift( event )
    {
        this.PlayButtonAudio();
        if(this.ToggleGift.isChecked)
        {
            PrivateRoomModule.SetRoomSpecialKind(true, this.ProtoBuf.TGameGuanDanSpecial.TGDSK_GIFT);
        }
        else
        {
            PrivateRoomModule.SetRoomSpecialKind(false, this.ProtoBuf.TGameGuanDanSpecial.TGDSK_GIFT);
        }
    }

    //点击是否固定座位
    private OnClickToggleFixedSeat( event )
    {
        this.PlayButtonAudio();
        if (this.ToggleFixedSeat.isChecked)
        {
            PrivateRoomModule.SetRoomSpecialKind(true, this.ProtoBuf.TGameGuanDanSpecial.TGDSK_GDZW);
        }
        else
        {
            PrivateRoomModule.SetRoomSpecialKind(false, this.ProtoBuf.TGameGuanDanSpecial.TGDSK_GDZW);
        }
    }

    //点击双下升级
    private OnClickToggleUpgrade( event )
    {
        this.PlayButtonAudio();
        if( event == this.ToggleUpgrade3 )
        {
            PrivateRoomModule.SetRoomSpecialKind( true, this.ProtoBuf.TGameGuanDanSpecial.TGDSK_DL3J);
		    PrivateRoomModule.SetRoomSpecialKind( false, this.ProtoBuf.TGameGuanDanSpecial.TGDSK_DL4J);
        }
        else if( event == this.ToggleUpgrade4 )
        {
            PrivateRoomModule.SetRoomSpecialKind( false, this.ProtoBuf.TGameGuanDanSpecial.TGDSK_DL3J);
		    PrivateRoomModule.SetRoomSpecialKind( true, this.ProtoBuf.TGameGuanDanSpecial.TGDSK_DL4J);
        }
    }

    //点击翻倍
    private OnClickToggleDoubleScore( event )
    {
        this.PlayButtonAudio();
        PrivateRoomModule.SetRoomSpecialKind(false,this.ProtoBuf.TGameGuanDanSpecial.TGDSK_FB);
        PrivateRoomModule.SetRoomSpecialKind(false,this.ProtoBuf.TGameGuanDanSpecial.TGDSK_2FB);
        PrivateRoomModule.SetRoomSpecialKind(false,this.ProtoBuf.TGameGuanDanSpecial.TGDSK_3FB);

        if( event == this.ToggleNoDouble )
        {
            PrivateRoomModule.SetRoomSpecialKind(true,this.ProtoBuf.TGameGuanDanSpecial.TGDSK_FB);
        }
        else if( event == this.Toggle2Double )
        {
            PrivateRoomModule.SetRoomSpecialKind(true,this.ProtoBuf.TGameGuanDanSpecial.TGDSK_2FB);
        }
        else if( event == this.Toggle3Double )
        {
            PrivateRoomModule.SetRoomSpecialKind(true,this.ProtoBuf.TGameGuanDanSpecial.TGDSK_3FB);  
        }
        else 
        {
            PrivateRoomModule.SetRoomSpecialKind(true,this.ProtoBuf.TGameGuanDanSpecial.TGDSK_FB);
        }
    }

    //设置默认消耗ID
    private SetDefaultCostID()
    {
        if(PrivateRoomModule.GetRoomSpecialKind(this.ProtoBuf.TGameGuanDanSpecial.TGDSK_JDWF))
        {
            PrivateRoomModule.SetConsumeID( 34 );
        }
        else
        {
            PrivateRoomModule.SetConsumeID( 35 );
        }
    }

    //刷新玩法
    private RefreshWanFa()
    {
        PrivateRoomModule.SetRoomType("GD_XJ");
        PrivateRoomModule.ResetRoomSpecialKind();
        this.ResetData();
        PrivateRoomModule.SetRoomPlayerCount( 4 );
        if ( PrivateRoomModule.GetRoomSpecialKind(this.ProtoBuf.TGameGuanDanSpecial.TGDSK_JDWF) ) 
        {
            PrivateRoomModule.SetConsumeID( 34 );
        }
        else
        {
            PrivateRoomModule.SetConsumeID( 35 ); 
        }
        //玩法
        this.ToggleJDWF.isChecked 		= PrivateRoomModule.GetRoomSpecialKind( this.ProtoBuf.TGameGuanDanSpecial.TGDSK_JDWF ) ? true : false;
        this.ToggleTTZWF.isChecked 		= PrivateRoomModule.GetRoomSpecialKind( this.ProtoBuf.TGameGuanDanSpecial.TGDSK_TTZWF ) ? true : false;
        this.ToggleGift.isChecked 		= PrivateRoomModule.GetRoomSpecialKind( this.ProtoBuf.TGameGuanDanSpecial.TGDSK_GIFT ) ? true : false;
        this.ToggleFixedSeat.isChecked 	= PrivateRoomModule.GetRoomSpecialKind( this.ProtoBuf.TGameGuanDanSpecial.TGDSK_GDZW ) ? true : false;
        this.ToggleNoDouble.isChecked 	= PrivateRoomModule.GetRoomSpecialKind( this.ProtoBuf.TGameGuanDanSpecial.TGDSK_FB ) ? true : false;
        this.Toggle2Double.isChecked 	= PrivateRoomModule.GetRoomSpecialKind( this.ProtoBuf.TGameGuanDanSpecial.TGDSK_2FB ) ? true : false;
        this.Toggle3Double.isChecked 	= PrivateRoomModule.GetRoomSpecialKind( this.ProtoBuf.TGameGuanDanSpecial.TGDSK_3FB ) ? true : false;
        this.ToggleUpgrade3.isChecked 	= PrivateRoomModule.GetRoomSpecialKind( this.ProtoBuf.TGameGuanDanSpecial.TGDSK_DL3J ) ? true : false;
        this.ToggleUpgrade4.isChecked 	= PrivateRoomModule.GetRoomSpecialKind( this.ProtoBuf.TGameGuanDanSpecial.TGDSK_DL4J ) ? true : false;
        //付费方式
        let PayType : number = PrivateRoomModule.GetPayMode();
        this.ToggleFangzhu.isChecked        = PayType == this.ProtoBuf.TPaymentMechanism.ROOM_OWNER_OPTION ? true : false;
        this.ToggleAA.isChecked             = PayType == this.ProtoBuf.TPaymentMechanism.AA_SYSTEM_OPTION ? true : false;
        this.ToggleDayingjia.isChecked      = PayType == this.ProtoBuf.TPaymentMechanism.BIG_OWNER_OPTION ? true :false;
        
        let ConsumeID : number = PrivateRoomModule.GetConsumeID();
        if(PrivateRoomModule.GetRoomSpecialKind(this.ProtoBuf.TGameGuanDanSpecial.TGDSK_JDWF))
        {
            this.ToggleJDWF.isChecked = true;
            this.GoKXWanFa.active = true;
            this.GoDouble.active = true;
            this.ToggleGameCount1.isChecked = ConsumeID == 34 ? true : false;
        }
        else if(PrivateRoomModule.GetRoomSpecialKind(this.ProtoBuf.TGameGuanDanSpecial.TGDSK_TTZWF))
        {
            this.ToggleTTZWF.isChecked = true;
            this.GoKXWanFa.active = false;
            this.GoDouble.active = false;
            this.ToggleGameCount1.isChecked = ConsumeID == 35 ? true : false;
            this.ToggleGameCount2.isChecked = ConsumeID == 36 ? true : false;
            this.ToggleGameCount3.isChecked = ConsumeID == 37 ? true : false;
        }
    }

    //重置数据
    private ResetData()
    {
        PrivateRoomModule.SetRoomSpecialKind(true , this.ProtoBuf.TGameGuanDanSpecial.TGDSK_GIFT);
        PrivateRoomModule.SetRoomSpecialKind(true , this.ProtoBuf.TGameGuanDanSpecial.TGDSK_JDWF);
        PrivateRoomModule.SetRoomSpecialKind(true , this.ProtoBuf.TGameGuanDanSpecial.TGDSK_QA);
        PrivateRoomModule.SetRoomSpecialKind(false, this.ProtoBuf.TGameGuanDanSpecial.TGDSK_TTZWF);
        PrivateRoomModule.SetRoomSpecialKind(false, this.ProtoBuf.TGameGuanDanSpecial.TGDSK_GDZW);
        PrivateRoomModule.SetRoomSpecialKind(false, this.ProtoBuf.TGameGuanDanSpecial.TGDSK_2FB);
        PrivateRoomModule.SetRoomSpecialKind(false, this.ProtoBuf.TGameGuanDanSpecial.TGDSK_3FB);
        PrivateRoomModule.SetRoomSpecialKind(true , this.ProtoBuf.TGameGuanDanSpecial.TGDSK_FB);
        PrivateRoomModule.SetRoomSpecialKind(false, this.ProtoBuf.TGameGuanDanSpecial.TGDSK_DL3J);
        PrivateRoomModule.SetRoomSpecialKind(true , this.ProtoBuf.TGameGuanDanSpecial.TGDSK_DL4J);
    }
}