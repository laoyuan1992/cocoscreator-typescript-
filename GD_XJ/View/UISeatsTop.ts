import UISeatsBase from "./UISeatsBase";
import GDCardUIPanel from "./GDCardUIPanel";
import GuanDanCardLayout from "./GuanDanCardLayout";
import GameDefine from "../Module/GameDefine";
import GameCard from "../Module/GameCard";
import ResourcesManager from "../../Framework/ResourcesManager";
import GDHandCardGroup from "./GDHandCardGroup";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UISeatsTop extends UISeatsBase
{
    @property(cc.Node)
    TeamCards : cc.Node               = null;

    //删除所有手牌实例
    public ClearHandCards()
    {
        super.ClearHandCards();
        this.ShowTeamCards( false );
    }

    public ShowTeamCards( Show )
    {
        this.TeamCards.active = Show;
    }

    public SetInitialLayout( Deal )
    {
        super.SetInitialLayout( Deal );
        let CardCount = this.GamePlayer.GetHandCardCount();
        this.ShowTeamCards( CardCount > 0 );
    }

    //创建手牌实例
    public CreateHandCardInst( CardInfo : GameCard  ) : GDCardUIPanel
    {
        if( null == this.HandCardParent ) return null;

        let Path = GameDefine.PrefabPath + "GuanDanHandCard";
        let Obj:cc.Node = ResourcesManager.LoadPrefab( Path , this.HandCardParent );
        if( Obj == null ) return;
        let GDCard : GDCardUIPanel  = Obj.getComponent( "GDCardUIPanel" );
        if ( GDCard == null )return;
        GDCard.SetCardInfo( CardInfo );
        this.HandCardList.Push( GDCard );

        return GDCard;
    }

    //布局手牌位置并移动到目标位置;
    public LayoutHandCards()
    {
        let LayoutWeight = 1130;
	    let Weight = 0;
        let Height = 0;
        let Count = this.HandCardGrpList.GetCount() % 2;
        Height = GameDefine.BottomCardGap;
        if( this.HandCardGrpList.GetCount() <= 10 )
        {
            Weight = 0;
        }
        else
        {
            Weight = -( this.HandCardGrpList.GetCount() * this.CardLayout.CardWeight - LayoutWeight ) / ( this.HandCardGrpList.GetCount() - 1 );
        }

        for ( let idx = 1; idx <= this.HandCardGrpList.GetCount(); idx ++ )
        {
            let Grp : GDHandCardGroup = this.HandCardGrpList.Get( idx );
            Grp.SetSortIndex( idx );
            let Idx = this.GetGrpXOffset(idx);
            for ( let j = 1 ; j <= Grp.HandCardList.GetCount(); j++ )
            {
                let GDCardUI : GDCardUIPanel = Grp.HandCardList.Get( j );
                let x = Idx * ( this.CardLayout.CardWeight + Weight );
                let y = this.CardLayout.CardHeigt * 0.5 + Height * j;
                GDCardUI.SetMoveToPos( new cc.Vec2(x,y) );
                let stretchy = 0;
                if ( j == 1 )
                {
                    stretchy = y;
                }else
                {
                    stretchy = y + ( j -1 )*GameDefine.GDStretchDis;
                }
                GDCardUI.SetStretchToPos( new cc.Vec2( x , stretchy ) );
            }
        }
    }

    //获取排版x偏移
    private GetGrpXOffset(Idx)
    {
        let LeftOff = ( this.HandCardGrpList.GetCount() - 1 ) * -0.5;
        let XOffset = LeftOff + (Idx - 1) * 1.0;
        return XOffset;
    }

    //设置牌排版信息
    public SetCardLayout()
    {
      if ( this.CardLayout == null )
      {
          this.CardLayout = new  GuanDanCardLayout();
      }
      this.CardLayout.XCollocateMode = GameDefine.XCollocateMode.XCenter;
      this.CardLayout.YCollocateMode = GameDefine.YCollocateMode.YBottom;
      this.CardLayout.Horizontal = true;
      this.CardLayout.CardWeight = GameDefine.BottomCardWidth;
      this.CardLayout.CardHeigt  = GameDefine.BottomCardHeight;
    }

    public GetRiverEndPos() : cc.Vec2
    {
        return new cc.Vec2( 573, 41 );
    }

    public GetRiverInitPos() : cc.Vec2
    {
        return new cc.Vec2( 573, 170 );
    }
}
