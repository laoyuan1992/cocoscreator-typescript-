//-------------------------------------------------------------------------------------------------
// 跑马灯
//-------------------------------------------------------------------------------------------------
import UIBase from "../../Common/UI/UIBase";
import PaoMaDengModule from "../Model/PaoMaDengModule";
import UIManager from "../../Common/UI/UIManager";
import { UIType } from "../../Common/UI/UIDefine";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIPaoMaDeng extends UIBase 
{

    @property(cc.Label)
    TextMessage: cc.Label = null;       // 显示内容
    @property(cc.Node)
    ImageBG: cc.Node = null;          // 背景

    private mBeginPos    : cc.Vec2       = new cc.Vec2(0,0) ;        // 开始位置
    private mWaitTime    : number        = 0;                        // 间隔时间
    private mTimeID      : number        = null;                     // 计时器


    start () 
    {
        this.mBeginPos = this.TextMessage.node.position;
        this.PlayPaoMaDeng();
    }

    onDestroy()
    {
        if( null != this.mTimeID )
        {
            clearTimeout( this.mTimeID );
        }
    }

    //播放跑马灯
    private PlayPaoMaDeng()
    {
        let PMDInfo = PaoMaDengModule.GetData();
        if( PMDInfo == null )
        {
            UIManager.DestroyUI(UIType.UI_PAOMADENG);
            return;
        }
        this.ImageBG.active             = true;
        this.mWaitTime                  = PMDInfo.WaitTime;
        this.TextMessage.node.position  = this.mBeginPos;
        this.TextMessage.string         = PMDInfo.Content;
        let EndPosX                     = this.TextMessage.node.getPositionX() + this.TextMessage.node.width * 2;
        let EndPos                      = new cc.Vec2( -EndPosX , 0 );
        let duration                    = Math.abs( EndPosX/100 < 6 ? 6 : EndPosX / 100 );
        let Move                        = cc.moveTo( duration , EndPos );
        let Action                      = cc.sequence( Move , cc.callFunc(this.MoveFinish,this) )
        this.TextMessage.node.runAction( Action );
    }

    private MoveFinish()
    {
        this.ImageBG.active = false;
        if( this.mTimeID == null )
        {
            this.mTimeID = setTimeout(this.RefreshTime.bind(this) , this.mWaitTime * 1000 );
        }

    }

    private RefreshTime()
    {
        this.PlayPaoMaDeng();
        this.mTimeID = null;
    }
}
