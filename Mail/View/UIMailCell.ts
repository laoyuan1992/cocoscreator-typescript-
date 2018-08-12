import MailModule from "../Model/MailModule";
import Mail from "../Model/Mail";
import TimeHelper from "../../Utility/TimeHelper";
import UIBase from "../../Common/UI/UIBase";

//-------------------------------------------------------------------------------------------------
// 单封邮件标签
//-------------------------------------------------------------------------------------------------
const {ccclass, property} = cc._decorator;

@ccclass
export default class UIMailCell extends UIBase 
{

    @property(cc.Label)
    TextTitle: cc.Label = null;

    @property(cc.Label)
    TextTime: cc.Label = null;

    @property(cc.Sprite)
    ImgRecvIcon: cc.Label = null;
    @property(cc.Sprite)
    ImgUnRecvIcon: cc.Label = null;

    private mMailID:number = null;

    //刷新邮件信息
    public RefreshMailInfo( MailID : number )
    {
        let MailData = MailModule.GetMailData( MailID );
        if( MailData == null ) return;
        this.mMailID = MailID;
        this.node.name = MailID.toString();
        this.RefreshTitle( MailData );
        this.RefreshTime( MailData );
        this.RefreshRecvIcon( MailData );
    }

    //刷新邮件名称
    private RefreshTitle( MailData:Mail )
    {
        this.TextTitle.string = MailData.Title;
    }

    //刷新时间
    private RefreshTime( MailData:Mail )
    {
        this.TextTime.string = TimeHelper.getDateAndTimeText(MailData.SendTime);
    }

    //刷新领取图标
    private RefreshRecvIcon( MailData:Mail )
    {
        if(MailData.RecvState)
        {
            this.ImgRecvIcon.node.active = true;
            this.ImgUnRecvIcon.node.active = false;
        }
        else
        {
            this.ImgRecvIcon.node.active = false;
            this.ImgUnRecvIcon.node.active = true;
        }
    }

    //点击标签
    private OnClickToggle()
    {
        this.PlayButtonAudio();
        cc.systemEvent.emit( "RV_OC_MC" ,this.node.name );
    }

    public get MailID()         : number        {  return this.mMailID;                 }
    
}
