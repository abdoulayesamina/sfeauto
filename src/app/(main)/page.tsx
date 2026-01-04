import { Button } from '@/src/shared/components/ui/button'
import Link from "next/link"

function page() {
    return (
        <div>
            <h1 className='text-red-500'>Hello World</h1>
            <Button><Link href="/dashboard">Go to Dashboard</Link></Button>
        </div>
    )
}

export default page
