import UIBase from "../../Common/UI/UIBase";
import MailModule from "../Model/MailModule";
import UIManager from "../../Common/UI/UIManager";
import * as UIDefines from "../../Common/UI/UIDefine"
import LinkedList from "../../Common/DataStruct/LinkedList";
import MessageModule from "../../Message/Model/MessageModule";
import MessageConfig from "../../Config/MessageConfig";
import Mail from "../Model/Mail";
import ItemPrototype from "../../Config/ItemPrototype";
import NetManager from "../../Common/Net/NetManager";
import ResourcesManager from "../../Framework/ResourcesManager";
import EventName from "../../Common/Event/EventName";
import Util from "../../Utility/Util";
import MessageBox from "../../Common/UI/MessageBox";

//-------------------------------------------------------------------------------------------------
// 邮件界面
//-------------------------------------------------------------------------------------------------

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIMail extends UIBase {

    @property(cc.Node)
    ObjPrompt: cc.Node = null;                  //无邮件提示
    @property(cc.Button)
    BtnRecvReward: cc.Button = null;            //领取按钮
    @property(cc.Button)
    BtnDeleteMail: cc.Button = null;            //删除按钮
    @property(cc.Label)
    TextContent: cc.Label = null;               //邮件内容
    @property(cc.Node)
    ObjItemParent: cc.Node = null;              //道具父物体
    @property(cc.Node)
    ObjItem: cc.Node = null;                    //道具
    @property(cc.Node)
    GridParent: cc.Node = null;                 //标签父物体
    @property(cc.Sprite)
    ImgItem: cc.Sprite = null;                  //道具图标
    @property(cc.Label)
    TextItemTitle: cc.Label = null;             //邮件名称

    private mSelectID       : number        = null;                         //选中邮件ID
    private mMailCellList   :LinkedList     = new LinkedList();             //邮件列表

    start () 
    {
        cc.systemEvent.on( EventName.EVENT_UI_REFRESH_MAIL , this.RefreshUIMail , this );
        cc.systemEvent.on( EventName.EVENT_UI_REFRESH_MAIL_REWARD_STATE, this.RefreshMailRewardState , this )
        cc.systemEvent.on( "RV_OC_MC", this.RevcOnClickMailCell , this )
    }

    onDestroy()
    {
        this.HideMailRedPoint();
    }

    onEnable()
    {
        MailModule.RequestMailList();
    }

    //点击关闭
    private OnClickClose()
    {
        this.PlayButtonAudio();
        UIManager.DestroyUI(UIDefines.UIType.UI_MAIL);
    }

    //刷新提示
    private SetPromptVisible()
    {
        let MailList : LinkedList = MailModule.GetMailList();
        if( MailList.GetCount() <=0 )
        {
            this.ObjPrompt.active = true;
        }
    }

    //领取邮件
    private OnClickRecvReward()
    {
        this.PlayButtonAudio();
        let MailData = MailModule.GetMailData( this.mSelectID );
        if( null == MailData ) return;
        if( MailData.IsPrivate )
        {
            MailModule.SendRecvCommonReward( this.mSelectID );
        }
        else
        {
            MailModule.SendRecvSystemReward( this.mSelectID );
        }
    }

    //删除邮件
    private DeleteMail()
    {
        let MailData = MailModule.GetMailData( this.mSelectID );
        if( null == MailData ) return;
        if( MailData.IsItemReward()  && !MailData.RecvState ) return;
        if(MailData.IsPrivate)
        {
            MailModule.SendDeleteCMail( this.mSelectID );
        }
        else
        {
            MailModule.SendDeleteSMail( this.mSelectID );
        }
    }

    //点击删除邮件
    private OnClickDeleteMail()
    {
        this.PlayButtonAudio();
        MessageBox.Instance.Show( 2 , MessageConfig.GetMessage(69) ,this.DeleteMail.bind(this) , null );
    }

    //刷新领取后按钮及标签状态
    private RefreshMailRewardState( Message )
    {
        let MailID = Message.detail
        this.mMailCellList.ForEach( (Cell) => {
            if( Util.Equal64Num(Cell.MailID , MailID) )
            {
                Cell.ImgRecvIcon.node.active = true;
            }
        } )
        if(  Util.Equal64Num(this.mSelectID , MailID))
        {
            this.BtnRecvReward.node.active = false;
        }
    }

    //点击邮件
    private RevcOnClickMailCell( Message )
    {
        this.PlayButtonAudio();
        let MailID = Message.detail;
        this.mSelectID = MailID;
        this.RefreshMailData( MailID );
    }

    //刷新邮件数据
    private RefreshMailData( MailID )
    {
        let Data = MailModule.GetMailData(MailID);
        if( Data == null ) return;
        this.RefreshMailContent( Data );
	    this.RefreshMailRecvState( Data );
	    this.RefreshMailItem( Data );
    }

    //刷新邮件内容
    private RefreshMailContent( Data : Mail )
    {
        this.TextContent.string = Data.Content;
    }

    //刷新邮件道具显示
    private RefreshMailItem( Data : Mail )
    {
        this.ObjItem.active = false;
        this.ObjItemParent.active = false;
        if( !Data.IsItemReward() )  return;
        this.ObjItem.active = true;
        this.ObjItemParent.active = true;
        let ProtoBuf = NetManager.GetProtobuf();
        let Atlas = ItemPrototype.GetCellData( Data.ItemID , ProtoBuf.TAttribType.ATLAS_FOR_ICON_STRING )
        let IconName = ItemPrototype.GetCellData( Data.ItemID , ProtoBuf.TAttribType.ICON_STRING );
        let ItemName = ItemPrototype.GetCellData( Data.ItemID , ProtoBuf.TAttribType.NAME_STRING );
        this.ImgItem.spriteFrame = ResourcesManager.LoadSprite( UIDefines.HallResPath.AltasPath + Atlas , IconName );
        this.TextItemTitle.string = ItemName + "x" + Data.ItemNums;
    }

    //刷新领取按钮与删除按钮显示
    private RefreshMailRecvState( Data:Mail )
    {
        if( !Data.IsItemReward() )
        {
            this.BtnDeleteMail.node.active = true;
            this.BtnRecvReward.node.active = false;
        }
        else
        {
            if(Data.RecvState)
            {
                this.BtnDeleteMail.node.active = false;
                this.BtnRecvReward.node.active = false;
            }
            else
            {
                this.BtnDeleteMail.node.active = false;
                this.BtnRecvReward.node.active = true;
            }
        }
    }

    //隐藏邮箱红点
    private HideMailRedPoint()
    {
        let IsHideRedPoint = false;
        let MailList :LinkedList = MailModule.GetMailList();

        if( 0 == MailList.GetCount() )
        {
            cc.systemEvent.emit( EventName.EVENT_UI_REFRESH_HIDE_MAIL_RED_POINT );
            return;
        }

        MailList.ForEach( (MailData) =>
        {
            if( MailData.IsItemReward() && !MailData.RecvState )
            {
                IsHideRedPoint = true;
            }
        } )
        if( !IsHideRedPoint )
        {
            cc.systemEvent.emit( EventName.EVENT_UI_REFRESH_HIDE_MAIL_RED_POINT );
        }
    }

    //刷新邮箱界面
    private RefreshUIMail()
    {
        let MailList:LinkedList        = MailModule.GetMailList();
        let MailListCount:number       = MailList.GetCount();
        let MailCellListCount:number   = this.mMailCellList.GetCount();

        //隐藏全部邮件
        this.HideAllMailCell()

        this.SetPromptVisible();
        //隐藏小红点
        if( 0 == MailListCount )
        {
            this.BtnDeleteMail.node.active =false;
            cc.systemEvent.emit( EventName.EVENT_UI_REFRESH_HIDE_MAIL_RED_POINT );
            return;
        }

        //刷新已有Cell数据
        let Idx = 1
        this.mMailCellList.ForEach( (Cell) => {
            if(Idx > MailListCount) return;
            Cell.node.active = true;
            let MailData:Mail = MailList.Get(Idx);
            Cell.RefreshMailInfo( MailData.MailID, MailData.MailKind );
            Idx++;
        } )

        //显示邮件内容
        this.TextContent.node.active = true;

        //排版
        if( this.mMailCellList.GetCount() >= MailListCount )
        {
            this.ShowFirstMail();
            return;
        }

        //创建缺少的数据
        for( let i = this.mMailCellList.GetCount() + 1 ; i<= MailListCount ; i++)
        {
            if( i > MailList.GetCount() ) break;
            let MailID   = MailList.Get(i).MailID;
            let MailType = MailList.Get(i).MailKind;
            this.CreateTable(MailID, MailType);
        }

        //默认显示第一份邮件
        this.ShowFirstMail();
    }

    //创建一个标签
    private CreateTable( MailID:number , MailType:number ) : cc.Node
    {
        if( null == this.GridParent ) return null;
        let Obj:cc.Node = ResourcesManager.LoadPrefab( UIDefines.HallResPath.PrefabPath + "ToggleMailCell" , this.GridParent );
        if( Obj == null ) return;
        let Cell = Obj.getComponent("UIMailCell");
        if(Cell == null ) return null;
        Cell.RefreshMailInfo(MailID,MailType);
        this.mMailCellList.Push(Cell);
        return Obj;
    }

    //默认显示邮件
    private ShowFirstMail()
    {
        let MailList:LinkedList = MailModule.GetMailList();
        if( 0 == MailList.GetCount() ) return;
        let MailData = MailList.Get(1);
        let Toggle:cc.Toggle = this.GetToggle( MailData.MailID.toString() );
        if( Toggle == null ) return;
        Toggle.isChecked = true;
        this.mSelectID = MailData.MailID;
        this.RefreshMailData( MailData.MailID );
    }

    //隐藏全部邮件
    private HideAllMailCell()
    {

        if( this.mMailCellList == null || this.mMailCellList.GetCount() == 0 ) return;
        this.mMailCellList.ForEach( (Cell) => {
            Cell.node.active = false;
        } )
        this.TextContent.node.active = false;
        this.ObjItemParent.active = false;
        this.BtnDeleteMail.node.active = false;
        this.BtnRecvReward.node.active = false;
    }

    //查找一个Toggle
    private GetToggle( Name:string ) : cc.Toggle
    {
        if( null == this.GridParent ) return null;
        if( null == Name) return null;
        let Obj:cc.Node = this.GridParent.getChildByName(Name)
        if( null == Obj ) return null;
        let Toggle = Obj.getComponent(cc.Toggle);
        return Toggle;
    }

}
