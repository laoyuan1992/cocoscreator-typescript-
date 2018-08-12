import Singleton from "../../Common/Function/Singleton";
import LinkedList from "../../Common/DataStruct/LinkedList";
import EventName from "../../Common/Event/EventName";
import NetManager from "../../Common/Net/NetManager";
import ItemPrototype from "../../Config/ItemPrototype";
import UIManager from "../../Common/UI/UIManager";
import GameDefine from "./GameDefine";
import UIGame from "../View/UIGame";
import ResourcesManager from "../../Framework/ResourcesManager";
import AppFacade from "../../Framework/AppFacade";
import MessageModule from "../../Message/Model/MessageModule";
import * as UIDefine from "../../Common/UI/UIDefine"

const {ccclass, property} = cc._decorator;

//========================================================= 
// 互动道具
//=========================================================

class Gift
{
    public ItemID:number = 0;
    public PID:number    = 0;
    public From:cc.Vec2  = null;
    public To:cc.Vec2    = null;
    constructor( from:cc.Vec2 , to:cc.Vec2 , itemID:number , pID:number )
    {
        this.From   =from;
        this.To     = to;
        this.ItemID = itemID;
        this.PID    = pID;
    }
}

@ccclass
class GameItemInteract extends Singleton 
{
    private mLastClickTime : number = 0;
    private mGiftList : LinkedList = new LinkedList;
    private mZero : cc.Vec2 = new cc.Vec2( 0,0 );

    //初始化
    public Init()
    {
        cc.systemEvent.on( EventName.NET_DO_INTERACTITEM , this.DoEventRevcUseItem , this );
    }

    //释放函数
    public OnRelease()
    {
        cc.systemEvent.off( EventName.NET_DO_INTERACTITEM , this.DoEventRevcUseItem , this );
        this.ReleaseSpine();
    }

    //释放Spine
    private ReleaseSpine()
    {
        let Count = this.mGiftList.GetCount();
        if(Count == 0) return;
        this.mGiftList.ForEach( (item) => {
            item.destroy();
        } )
        this.mGiftList.Clear();
    }

    //接受使用道具
    private DoEventRevcUseItem( Message )
    {
        let UIGameNode : cc.Node = UIManager.GetUI(GameDefine.GameUIConfig.UI_GAME.type);
        if( UIGameNode == null ) return;
        let UIGame : UIGame = UIGameNode.getComponent("UIGame");
        if( UIGame == null ) return;
        let ProtoBuf = NetManager.GetProtobuf();
        let msg = Message.detail.msg.ReadProtoBuf( ProtoBuf.MsgUseItemUpdate );
        //检查是否互动道具
        if( msg.item_info.length != 1 ) return;
        let UseData = msg.item_info[0];
        let ItemConfig = ItemPrototype.GetRowData( UseData.template_id );
        if(ItemConfig == null) return;
        let Seats = UIGame.GetSeats( msg.use_pid );
        if( Seats == null ) return;
        let mPosition : cc.Vec2 = Seats.RoleInfo.ImageIcon.node.convertToWorldSpaceAR(Seats.RoleInfo.ImageIcon.node.position) ;
        mPosition =new cc.Vec2(mPosition.x - 640 ,mPosition.y - 360);
        for ( let i = 0 ; i < msg.use_target.length ; i++ )
        {
            let TarSeats = UIGame.GetSeats( msg.use_target[i] );
            if(TarSeats != null)
            {
                let ToPosition = TarSeats.RoleInfo.ImageIcon.node.convertToWorldSpaceAR(TarSeats.RoleInfo.ImageIcon.node.position) ;
                ToPosition =new cc.Vec2(ToPosition.x - 640 ,ToPosition.y - 360);
                this.NewGift( mPosition ,ToPosition , UseData.template_id , msg.use_target[i] );
            }
        }
    }

    //实例一个礼物然后播放
    private NewGift( From : cc.Vec2, To : cc.Vec2, ItemID : number , PID : number )
    {
        if( From == this.mZero || To == this.mZero ) return;

        let ProtoBuf = NetManager.GetProtobuf();
        let Path =ItemPrototype.GetCellData( ItemID , ProtoBuf.TAttribType.MODEL_STRING );
        if( Path == null ) return;
        let GiftInfo = new Gift( From, To, ItemID, PID );
        if( GiftInfo == null ) return; 
        let Parent = cc.find( UIDefine.UIMisc.UIParentName );
        let Obj : cc.Node = ResourcesManager.LoadSpine(GameDefine.SpinePath + Path ,Parent, true , "play" );
        if(Obj == null ) return;
        Obj.position = GiftInfo.From;
        let Dis = Math.sqrt( Math.pow( (GiftInfo.From.x-GiftInfo.To.x ), 2) + Math.pow( (GiftInfo.From.y - GiftInfo.To.y ),2 ));
        let Speed = ( Dis / 1 + 1 ) * 1;
        let time = Dis / Speed;
        let Action = cc.moveTo( time , GiftInfo.To );
        Obj.runAction(Action);
        this.mGiftList.Push(Obj);
        AppFacade.Instance.GetSoundManager().PlayGameSoundEffect( GameDefine.RoomType , GameDefine.LiPinFeiXing );
        setTimeout( () => {
            this.WaitDestroyNormalGiftSpine(Obj);
        } ,time * 1000, Obj );
    }

    //等待销毁普通SPINE
    private WaitDestroyNormalGiftSpine( Obj : cc.Node )
    {
        if(null != Obj)
        {
            setTimeout( () => {
                this.mGiftList.RemoveOneByValue(Obj);
                Obj.destroy();
            } , 3000);
        }
    }

    //礼物点击等待
    public WaitClickGift()
    {
        let CurClickTime = Date.now();
        if ((CurClickTime - this.mLastClickTime ) >= 2000 )
        {
            this.mLastClickTime = CurClickTime;
		    return true;
        } 
        MessageModule.ShowMessage(66);
		return false;
    }
}

export default GameItemInteract.GetInstance();
