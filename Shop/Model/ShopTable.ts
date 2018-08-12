import LinkedList from "../../Common/DataStruct/LinkedList";

//=========================================================
// 商店道具信息
//=========================================================
class ShopItem{
    private mAutoId		    :number = 0;	// 自增ID
	private mItemId 		:number = 0;	// 道具ID
	private mItemCount		:number = 0;	// 道具数量
	private mCurrencyType	:number = 0;	// 1:人民币 , 2:纸蛙豆 , 3:棋院钱包 , 4: 钻石 5: 礼券
	private mConsumeItemId  :number = 0;	// 所需消耗道具ID
	private mPrice			:number = 0;	// 商品单价
	private mIconUrl 		:string = "";	// 商品图片URL
	private mGiftItemId	    :number = 0;	// 赠送道具
	private mGiftCount		:number = 0;	// 赠送数量
	private mName 			:string = "";	// 名字
    private mDetail 		:string = "";	// 描述
    
    //填充商城数据
    public FillShopItem( Param )
    {
        if(Param["auto_id"])        { this.mAutoId          = Param["auto_id"]       };
        if(Param["item_id"])        { this.mItemId          = Param["item_id"]       };
        if(Param["item_num"])       { this.mItemCount       = Param["item_num"]      };
        if(Param["currency_type"])  { this.mCurrencyType    = Param["currency_type"] };
        if(Param["consume_id"])     { this.mConsumeItemId   = Param["consume_id"]    };
        if(Param["price"])          { this.mPrice           = Param["price"]         };
        if(Param["gift_type"])      { this.mGiftItemId      = Param["gift_type"]     };
        if(Param["gift_num"])       { this.mGiftCount       = Param["gift_num"]      };
        if(Param["name"])           { this.mName            = Param["name"]          };
        if(Param["detail"])         { this.mDetail          = Param["detail"]        };
        if(Param["icon_url"])       { this.mIconUrl         = Param["icon_url"]      };
    }

    public get AutoID()         : number { return this.mAutoId          } ;
    public get ItemId()         : number { return this.mItemId          } ;
    public get ItemCount()      : number { return this.mItemCount       } ;
    public get CurrencyType()   : number { return this.mCurrencyType    } ;
    public get ConsumeItemId()  : number { return this.mConsumeItemId   } ;
    public get Price()          : number { return this.mPrice           } ;
    public get GiftItemId()     : number { return this.mGiftItemId      } ;
    public get GiftCount()      : number { return this.mGiftCount       } ;
    public get IconUrl()        : string { return this.mIconUrl         } ;
    public get Name()           : string { return this.mName            } ;
    public get Detail()         : string { return this.mDetail          } ;
}

//=========================================================
// 商店标签信息
//=========================================================
class ShopTable  
{
    private mID         : number     = 0;
    private mOrder      : number     = 0;
    private mName       : string     = "";
    private mShopItems  : LinkedList = new LinkedList();

    //填充商城标签信息
    public FillShopKind( Param )
    {
        if( Param == null ) return;
        if ( Param["name"]      != null ) { this.mName      = Param["name"];        }
        if ( Param["id"]        != null ) { this.mID        = parseInt( Param["id"] );          }
        if ( Param["order"]     != null ) { this.mOrder     = parseInt( Param["order"] );       }
        if ( Param["item_list"] != null ) 
        {
            for( let i = 0 ; i < Param["item_list"].length ; i++ )
            {
                let item = new ShopItem();
                item.FillShopItem( Param["item_list"][i] );
                this.mShopItems.Push(item);
            }
        }
    }
    public get Order()      : number            { return this.mOrder    };
    public get ShopItems()  : LinkedList        { return this.mShopItems};
    public get Name()       : string            { return this.mName     };
}
export { ShopTable , ShopItem }