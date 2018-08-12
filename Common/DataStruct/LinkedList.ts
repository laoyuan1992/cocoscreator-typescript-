
/*************************************************************************
 * 作者: sunny
 * 时间: 07/05/2018
 * 说明: 链表存储有序的元素集合 链表中的元素在内存中并不是连续放置的,每个元素由一个
 * 元素本身的节点和一个指向下一个元素的引用
 **************************************************************************/

class DataNode
{
    element : any;
    next    : any;
    constructor( el:any )
    {
        this.element    = el;
        this.next       = null;
    }
}

// 下标为1 开始
export default class LinkedList
{
    private head    : any;
    private length  : number;

    constructor()
    {
        this.head   = null;
        this.length = 0;
    }

    public Push( el : any )
    {
        let node = new DataNode( el );
        if ( this.length == 0 && this.head == null )
        {
            this.head = node;
        }else
        {
            let cur : DataNode = this.head;
            while ( cur.next != null )
            {
                cur = cur.next;
            }
            cur.next = node;
        }

        this.length++;
    }

    public Get( index : number )
    {
        if ( index <= 0 || index > this.length || this.head == null )
        {
            return null;
        }
        let cur : DataNode = this.head;
        let idx = 1;
        while ( cur != null )
        {
            if ( idx == index )
            {
                return cur.element;
            }
            idx++;
            cur = cur.next;
        }

        return null;
    }

    public RemoveOneByValue( value : any ) : boolean
    {
        if ( value == null || this.head == null )
        {
            return false;
        }
        
        let cur : DataNode = this.head;
        if ( cur.element == value )
        {
            this.head = cur.next;
            this.length--;
            return true;
        }
        let tem : DataNode = cur;
        while ( cur.next != null )
        {
            tem = cur;
            cur = cur.next;
            if ( value == cur.element )
            {
               tem.next = cur.next;
               this.length--;
               return true;
            }
        }
        return false; 
    }

    public RemoveAllByValue( value : any )
    {
        for ( let i = 1; i <= this.length; i++ )
        {
            this.RemoveOneByValue(value)
        }
    }

    public RemoveByIndex( index : number  ) : boolean
    {
        if ( index <= 0 || index > this.length || this.head == null )
        {
            return false;
        }
        let cur : DataNode = this.head;
        if ( index == 1 )
        {
            this.head = cur.next;
            this.length--;
            return true;
        }

        let idx = 1;
        let tem : DataNode = cur;
        while ( cur.next != null && idx < index )
        {
            idx++;
            tem = cur;
            cur = cur.next;
        }
        if ( idx == index )
        {
            tem.next = cur.next;
            this.length--;
            return true;
        }
        return false;
    }

    public GetCount()
    {
        return this.length;
    }

    public Clear()
    {
        this.head   = null;
        this.length = 0;
    }

    public ForEach( func : any  )
    {
        if ( this.head == null )
        {
            return;
        } 

        let cur : DataNode = this.head;
        while ( cur != null )
        {
            func( cur.element  );
            cur = cur.next;
        }   
    }

    public Contain( value : any )
    {
        if ( this.head == null )
        {
            return false;
        } 

        let cur : DataNode = this.head;
        while ( cur != null )
        {
            if ( value == cur.element )
            {
                return true;
            }
            cur = cur.next;
        }   

        return false;
    }

    // 获取元素的索引
    // 找不到返回-1
    public IndexOf( value : any ) : number
    {
        if ( this.head == null )
        {
            return -1;
        } 
        let Idx = 0;
        let cur : DataNode = this.head;
        while ( cur != null )
        {
            Idx ++ ;
            if ( value == cur.element )
            {
                return Idx;
            }
            cur = cur.next;
        }   

        return -1;
    }

    // func 返回true 是降序 false 是升序
    public Sort( func : any )
    {
        if ( this.head == null )
        {
            return;
        } 
        let cur  : DataNode = this.head;
        for( ; cur != null ;cur = cur.next )
        {
            for( let back = cur.next; back != null; back = back.next )
            {
                if( !func( cur.element , back.element ) )
                {
                    let temp     = back.element;
                    back.element = cur.element;
                    cur.element  = temp;
                }
            }
        }  
    }

    public Assign( InList : LinkedList )
    {
        this.Clear();
        this.Append( InList );
    }

    public Clone() : LinkedList
    {
        let NewList : LinkedList= new LinkedList();
        NewList.Assign( this );
        return NewList;
    }

    public Append( InList : LinkedList )
    {
        for ( let i = 1; i <= InList.GetCount(); i ++ )
        {
            this.Push( InList.Get(i) );
        }
    }

    public Insert( index : number , value : any )
    {
        if ( this.head == null || index > this.length )
        {
            return;
        }
        let node = new DataNode( value );
        if ( index == 1 )
        {
            let tem = this.head;
            this.head = node;
            node.next = tem;
        }else
        {
            let idx = 1;
            let cur : DataNode = this.head;
            let back : DataNode = cur;
            while( cur.next!= null && idx < index )
            {
                back = cur;
                cur  = cur.next;
                idx++;
            }
            if ( idx == index )
            {
                let tem = back.next;
                back.next = node;
                node.next = tem;
            }
        }
        this.length++;
    }

    public RemoveIf( func : any)
    {
        if ( this.head == null )
        {
            return;
        } 
        let cur  : DataNode = this.head;
        for( ; cur != null ;cur = cur.next )
        {
            if( func( cur.element ) )
            {
                this.RemoveOneByValue( cur.element );
                return;
            }
        }  
    }

    public NumsOf( Value : any )
    {
        if ( this.head == null )
        {
            return 0;
        } 
        let Nums = 0;
        this.ForEach( ( item )=>
        {
            if ( item == Value )
            {
                Nums++ ;
            }
        } );

        return Nums;
    }
}

