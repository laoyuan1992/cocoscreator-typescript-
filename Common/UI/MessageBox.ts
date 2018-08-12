//-------------------------------------------------------------------------------------------------
// MessageBox
//-------------------------------------------------------------------------------------------------
import Singleton from "../../Common/Function/Singleton"
import UIBase from "./UIBase";

const {ccclass, property} = cc._decorator;

@ccclass
class MessageBox extends UIBase  
{
    public static OK        = 1;        // OK风格
    public static OKCancel  = 2;        // OKCancel风格
    private static _Instance : MessageBox = null;
    public static get Instance()
    {
        return MessageBox._Instance;
    }

    // 回调函数，这里倒是也可以写成类似lua的那种方式，但是感觉麻烦
    private _OKCallback : any = null;
    private _CancelCallback : any = null;

    // 提示内容显示
    @property(cc.Label)
    lblContent: cc.Label = null;

    // OKCancel风格节点
    @property(cc.Node)
    NodeOKCancel: cc.Node = null;

    // OK风格节点
    @property(cc.Node)
    NodeOK: cc.Node = null;

    // OKCancel风格中的确定按钮
    @property(cc.Button)
    btnOKCancel_OK: cc.Button = null;

    // OKCancel风格中的取消按钮
    @property(cc.Button)
    btnOKCancel_Cancel: cc.Button = null;

    // OK风格中的确定按钮
    @property(cc.Button)
    btnOK_OK: cc.Button = null;

    onLoad()
    {
        MessageBox._Instance = this;
        cc.log( "MessageBox.onLoad" );
    }

    start()
    {
        cc.log( "MessageBox.start" );
    }

    // 显示
    // Type             风格 OK OKCancel取其一，可以扩展
    // Content          显示的内容
    // OKCallback       确认按钮回调
    // CancelCallBack   取消按钮回调
    public Show( Type : number, Content : string, OKCallback : any, CancelCallBack : any = null )
    {
        cc.log( "MessageBox.Show..." );
        // 显示面板
        this.node.active = true;
        this.NodeOK.active = false;
        this.NodeOKCancel.active = false;
        this._OKCallback = OKCallback;
        this._CancelCallback = CancelCallBack;
        this.lblContent.string = Content;
        switch ( Type ) 
        {
            case MessageBox.OK:
                this.NodeOK.active = true;
                break;
            case MessageBox.OKCancel:
                this.NodeOKCancel.active = true;
                break;
            default:
                cc.log("MessageBox.Show未定义的风格类型");
                break;
        }
    }

    //双按钮OK
    public onClickOKCancel_OK()
    {
        this.PlayButtonAudio();
        this.node.active = false;
        if ( null != this._OKCallback )
        {
            this._OKCallback();
        }
    }

    //双按钮Cancel
    public onClickOKCancel_Cancel()
    {
        this.PlayButtonAudio();
        this.node.active = false;
        if ( null != this._CancelCallback )
        {
            this._CancelCallback();
        }
    }

    //单按钮OK
    public onClickOK_OK()
    {
        this.PlayButtonAudio();
        this.node.active = false;
        if ( null != this._OKCallback )
        {
            this._OKCallback();
        }
    }
}
export default MessageBox;
