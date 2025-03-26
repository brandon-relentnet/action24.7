import ShippingCalculator from "@/components/ShippingCalculator";

export default function ShippingPage() {
    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-light mb-4">Shipping Calculator</h1>
                <ShippingCalculator />
            </div>
        </div>
    );
}