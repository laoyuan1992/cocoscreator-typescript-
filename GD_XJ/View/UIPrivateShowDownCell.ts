import EventName from "../../Common/Event/EventName";
import GamePlayer from "../Module/GamePlayer";
import Util from "../../Utility/Util";
import HeadPoolModule from "../../HeadPool/Model/HeadPoolModule";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIPrivateShowDownCell extends cc.Component 
{
    @property(cc.Sprite)
    ImageFangZhu        : cc.Sprite         = null;
    @property(cc.Sprite)
    ImageIcon           : cc.Sprite         = null;
    @property(cc.Sprite)
    ImageDaYingJia      : cc.Sprite         = null;
    @property(cc.Sprite)
    ImageTuHao          : cc.Sprite         = null;
    @property(cc.Label)
    TextID              : cc.Label          = null;
    @property(cc.Label)
    TextName            : cc.Label          = null;
    @property(cc.Label)
    TextWinScore        : cc.Label          = null;
    @property(cc.Label)
    TextLoseScore       : cc.Label          = null;

    private mPlayer      : GamePlayer        = null;
    private mOwnShowDown : any               = null;
    
    onLoad () 
    {
        
    }

    start () 
    {
        cc.systemEvent.on( EventName.EVENT_UI_REFRESH_HEAD              , this.RefreshHead           , this);
        cc.systemEvent.on( EventName.EVENT_UI_REFRESH_NAME              , this.RefreshName           , this);
    }

    onDestroy()
    {
        cc.systemEvent.off( EventName.EVENT_UI_REFRESH_HEAD              , this.RefreshHead           , this);
        cc.systemEvent.off( EventName.EVENT_UI_REFRESH_NAME              , this.RefreshName           , this);
    }

    public RefreshPlayerInfo( Player : GamePlayer , ShowDownData : any )
    {
        if ( null == Player || null == ShowDownData ) return true;
        this.mPlayer = Player;
        this.RefreshShowDownData( ShowDownData );
        if ( this.mOwnShowDown == null )return;
        this.RefreshHead( this.mPlayer.GetPID() );
        this.RefreshName( this.mPlayer.GetPID() );
        this.RefreshScoreGUI();
        this.RefreshHouseOwner();
        this.RefreshID();
    }

    private RefreshShowDownData( ShowDownData : any )
    {
        for ( let i = 0; i < ShowDownData.win_role.length + ShowDownData.lost_role.length; i++ )
        {
            if ( i < 2 )
            {
                if ( Util.Equal64Num( this.mPlayer.GetPID() , ShowDownData.win_role[i].role_id ) )
                {
                    this.mOwnShowDown = ShowDownData.win_role[i];
                }
            }else
            {
                if ( Util.Equal64Num( this.mPlayer.GetPID() , ShowDownData.lost_role[i-2].role_id ) )
                {
                    this.mOwnShowDown = ShowDownData.lost_role[i-2];
                }
            }
        }
    }

    private RefreshHead( ID : number )
    {
        if ( !Util.Equal64Num( this.mPlayer.GetPID() , ID ) ) return;
        let Tex = HeadPoolModule.GetWxHead( this.mPlayer.GetUserName() , this.mPlayer.GetPID() );
        if ( null == Tex ) return
        this.ImageIcon.spriteFrame = new cc.SpriteFrame(Tex);   
    }

    private RefreshName( ID : number )
    {
        if ( !Util.Equal64Num( this.mPlayer.GetPID() , ID ) ) return;
        let Name = HeadPoolModule.GetWxName( this.mPlayer.GetUserName() , this.mPlayer.GetPID() );
        if ( null == Name ) return;
        this.TextName.string = Name;
    }
    
    private RefreshHouseOwner()
    {
        this.ImageFangZhu.node.active = this.mPlayer.IsOwenrRoom();
    }

    private RefreshID()
    {
        this.TextID.string = cc.js.formatStr( "(ID:%s)", this.mPlayer.GetPID() );
    }

    private RefreshScoreGUI()
    {
        if ( this.mOwnShowDown == null )return;
        this.TextWinScore.string    ="";
        this.TextLoseScore.string   ="";
        let Score = parseInt(this.mOwnShowDown.score);
        if(Score >= 0)
        {
            this.TextWinScore.string = "+" + Score.toString();
        }
        else
        {
            this.TextLoseScore.string = Score.toString();
        }
    }

    public RefreshWinTexture( MaxScore : number)
    {
        if ( this.mOwnShowDown == null )return;
        let Score = parseInt(this.mOwnShowDown.score);
        if ( Score == MaxScore && MaxScore != 0 )
        {
            this.ImageDaYingJia.node.active = true;
            this.ImageTuHao.node.active     = false;
        }else
        {
            this.ImageDaYingJia.node.active = false;
        }
    }

    public RefreshLoserTexture( Money : number)
    {
        if ( this.mOwnShowDown == null )return;
        let Score = parseInt(this.mOwnShowDown.score);
        if ( Score == Money && Money != 0 )
        {
            this.ImageDaYingJia.node.active = false;
            this.ImageTuHao.node.active     = true;
        }else
        {
            this.ImageTuHao.node.active = false;
        }
    }
}
