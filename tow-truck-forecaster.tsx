import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function TowTruckForecaster() {
  // Pricing inputs
  const [carBaseRate, setCarBaseRate] = useState(1800);
  const [carPerKmRate, setCarPerKmRate] = useState(80);
  const [bikeBaseRate, setBikeBaseRate] = useState(1400);
  const [bikePerKmRate, setBikePerKmRate] = useState(15);

  // Volume sliders
  const [carTowsPerMonth, setCarTowsPerMonth] = useState(30);
  const [bikeTowsPerMonth, setBikeTowsPerMonth] = useState(40);
  const [carUnder40Pct, setCarUnder40Pct] = useState(60);
  const [bikeUnder40Pct, setBikeUnder40Pct] = useState(70);
  const [avgDistanceOver40, setAvgDistanceOver40] = useState(60);

  // Cost inputs
  const [driverSalary, setDriverSalary] = useState(20000);
  const [maintenancePerMonth, setMaintenancePerMonth] = useState(5000);
  const [dieselPrice, setDieselPrice] = useState(95);
  const [mileage, setMileage] = useState(12);

  // Financing options
  const [financingMode, setFinancingMode] = useState('loan'); // 'cash', 'loan', 'lease'
  const [truckCost, setTruckCost] = useState(900000);
  const [loanAmount, setLoanAmount] = useState(900000);
  const [interestRate, setInterestRate] = useState(10);
  const [loanTenure, setLoanTenure] = useState(60);
  const [leaseAmount, setLeaseAmount] = useState(900000);
  const [includeInitialCost, setIncludeInitialCost] = useState(true);

  // Forecast period
  const [forecastMonths, setForecastMonths] = useState(36);

  // Calculate EMI
  const calculateEMI = () => {
    if (financingMode !== 'loan' || loanAmount === 0) return 0;
    const r = interestRate / 12 / 100;
    const n = loanTenure;
    const emi = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return emi;
  };

  const calculations = useMemo(() => {
    // Revenue calculations
    const carUnder40 = Math.round(carTowsPerMonth * (carUnder40Pct / 100));
    const carOver40 = carTowsPerMonth - carUnder40;
    const bikeUnder40 = Math.round(bikeTowsPerMonth * (bikeUnder40Pct / 100));
    const bikeOver40 = bikeTowsPerMonth - bikeUnder40;

    const carRevenueUnder40 = carUnder40 * carBaseRate;
    const carRevenueOver40 = carOver40 * (carBaseRate + (avgDistanceOver40 - 40) * carPerKmRate);
    const bikeRevenueUnder40 = bikeUnder40 * bikeBaseRate;
    const bikeRevenueOver40 = bikeOver40 * (bikeBaseRate + (avgDistanceOver40 - 40) * bikePerKmRate);

    const totalMonthlyRevenue = carRevenueUnder40 + carRevenueOver40 + bikeRevenueUnder40 + bikeRevenueOver40;

    // Distance calculations (assuming 2x distance for round trip)
    const carDistanceUnder40 = carUnder40 * 40 * 2;
    const carDistanceOver40 = carOver40 * avgDistanceOver40 * 2;
    const bikeDistanceUnder40 = bikeUnder40 * 40 * 2;
    const bikeDistanceOver40 = bikeOver40 * avgDistanceOver40 * 2;

    const totalMonthlyDistance = carDistanceUnder40 + carDistanceOver40 + bikeDistanceUnder40 + bikeDistanceOver40;
    const fuelCost = mileage > 0 ? (totalMonthlyDistance / mileage) * dieselPrice : 0;

    // Monthly costs
    const emi = calculateEMI();

    // Determine initial investment based on financing mode
    let initialInvestment = 0;
    if (includeInitialCost) {
      if (financingMode === 'cash') {
        initialInvestment = truckCost;
      } else if (financingMode === 'loan') {
        initialInvestment = Math.max(0, truckCost - loanAmount); // Down payment (prevent negative)
      } else if (financingMode === 'lease') {
        initialInvestment = leaseAmount;
      }
    }

    // Generate forecast data
    const forecastData = [];
    let cumulativeProfit = -initialInvestment;
    let breakEvenMonth = null;

    for (let month = 1; month <= forecastMonths; month++) {
      const monthlyEMI = (financingMode === 'loan' && month <= loanTenure) ? emi : 0;
      const monthCosts = driverSalary + maintenancePerMonth + fuelCost + monthlyEMI;
      const monthProfit = totalMonthlyRevenue - monthCosts;
      cumulativeProfit += monthProfit;

      if (breakEvenMonth === null && cumulativeProfit >= 0) {
        breakEvenMonth = month;
      }

      forecastData.push({
        month,
        revenue: totalMonthlyRevenue,
        costs: monthCosts,
        profit: monthProfit,
        cumulative: cumulativeProfit
      });
    }

    // Calculate first month costs for display (includes EMI only if within loan tenure)
    const firstMonthEMI = (financingMode === 'loan' && loanTenure > 0) ? emi : 0;
    const totalMonthlyCosts = driverSalary + maintenancePerMonth + fuelCost + firstMonthEMI;
    const monthlyProfit = totalMonthlyRevenue - totalMonthlyCosts;

    return {
      totalMonthlyRevenue,
      fuelCost,
      emi,
      totalMonthlyCosts,
      monthlyProfit,
      forecastData,
      breakEvenMonth,
      totalMonthlyDistance,
      initialInvestment
    };
  }, [carBaseRate, carPerKmRate, bikeBaseRate, bikePerKmRate, carTowsPerMonth, bikeTowsPerMonth,
    carUnder40Pct, bikeUnder40Pct, avgDistanceOver40, driverSalary, maintenancePerMonth,
    dieselPrice, mileage, financingMode, truckCost, loanAmount, interestRate, loanTenure,
    leaseAmount, includeInitialCost, forecastMonths]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Tow Truck Business Forecaster</h1>
        <p className="text-gray-600 mb-8">Adjust the parameters below to forecast your business financials</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Inputs */}
          <div className="lg:col-span-1 space-y-4">

            {/* Pricing Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Pricing Rates</h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Car Base Rate (≤40km)</label>
                  <input type="number" value={carBaseRate} onChange={(e) => setCarBaseRate(Number(e.target.value))}
                    className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Car Per KM Rate (>40km)</label>
                  <input type="number" value={carPerKmRate} onChange={(e) => setCarPerKmRate(Number(e.target.value))}
                    className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Bike Base Rate (≤40km)</label>
                  <input type="number" value={bikeBaseRate} onChange={(e) => setBikeBaseRate(Number(e.target.value))}
                    className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Bike Per KM Rate (>40km)</label>
                  <input type="number" value={bikePerKmRate} onChange={(e) => setBikePerKmRate(Number(e.target.value))}
                    className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border" />
                </div>
              </div>
            </div>

            {/* Volume Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Volume</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Car Tows: {carTowsPerMonth}</label>
                  <input type="range" min="0" max="100" value={carTowsPerMonth}
                    onChange={(e) => setCarTowsPerMonth(Number(e.target.value))}
                    className="mt-1 block w-full" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Bike Tows: {bikeTowsPerMonth}</label>
                  <input type="range" min="0" max="150" value={bikeTowsPerMonth}
                    onChange={(e) => setBikeTowsPerMonth(Number(e.target.value))}
                    className="mt-1 block w-full" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Car Tows Under 40km: {carUnder40Pct}%</label>
                  <input type="range" min="0" max="100" value={carUnder40Pct}
                    onChange={(e) => setCarUnder40Pct(Number(e.target.value))}
                    className="mt-1 block w-full" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Bike Tows Under 40km: {bikeUnder40Pct}%</label>
                  <input type="range" min="0" max="100" value={bikeUnder40Pct}
                    onChange={(e) => setBikeUnder40Pct(Number(e.target.value))}
                    className="mt-1 block w-full" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Avg Distance (>40km jobs): {avgDistanceOver40} km</label>
                  <input type="range" min="40" max="200" value={avgDistanceOver40}
                    onChange={(e) => setAvgDistanceOver40(Number(e.target.value))}
                    className="mt-1 block w-full" />
                </div>
              </div>
            </div>

            {/* Operational Costs */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Operational Costs</h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Driver Salary/Month (₹)</label>
                  <input type="number" value={driverSalary} onChange={(e) => setDriverSalary(Number(e.target.value))}
                    className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Maintenance/Month (₹)</label>
                  <input type="number" value={maintenancePerMonth} onChange={(e) => setMaintenancePerMonth(Number(e.target.value))}
                    className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Diesel Price/Liter (₹)</label>
                  <input type="number" value={dieselPrice} onChange={(e) => setDieselPrice(Number(e.target.value))}
                    className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Mileage (km/liter)</label>
                  <input type="number" min="0.1" step="0.1" value={mileage} onChange={(e) => setMileage(Math.max(0.1, Number(e.target.value)))}
                    className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border" />
                </div>
              </div>
            </div>

            {/* Financing Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Vehicle Financing</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Financing Mode</label>
                  <select
                    value={financingMode}
                    onChange={(e) => setFinancingMode(e.target.value)}
                    className="block w-full rounded border-gray-300 shadow-sm p-2 border"
                  >
                    <option value="cash">Cash Purchase</option>
                    <option value="loan">Loan</option>
                    <option value="lease">Lease (One-time)</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="includeInitialCost"
                    checked={includeInitialCost}
                    onChange={(e) => setIncludeInitialCost(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="includeInitialCost" className="text-sm font-medium text-gray-700">
                    Include initial investment in break-even
                  </label>
                </div>

                {financingMode === 'cash' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Truck Cost (₹)</label>
                    <input type="number" value={truckCost} onChange={(e) => setTruckCost(Number(e.target.value))}
                      className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border" />
                  </div>
                )}

                {financingMode === 'loan' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Truck Cost (₹)</label>
                      <input type="number" value={truckCost} onChange={(e) => setTruckCost(Number(e.target.value))}
                        className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Loan Amount (₹)</label>
                      <input type="number" max={truckCost} value={loanAmount} onChange={(e) => setLoanAmount(Math.min(truckCost, Number(e.target.value)))}
                        className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border" />
                      <p className="text-xs text-gray-500 mt-1">Down payment: ₹{(truckCost - loanAmount).toLocaleString('en-IN')}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Interest Rate (%)</label>
                      <input type="number" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))}
                        className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Loan Tenure (months)</label>
                      <input type="number" value={loanTenure} onChange={(e) => setLoanTenure(Number(e.target.value))}
                        className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border" />
                    </div>

                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-sm font-medium text-gray-700">Monthly EMI</p>
                      <p className="text-xl font-bold text-blue-600">₹{Math.round(calculateEMI()).toLocaleString('en-IN')}</p>
                    </div>
                  </>
                )}

                {financingMode === 'lease' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lease Amount (One-time) (₹)</label>
                    <input type="number" value={leaseAmount} onChange={(e) => setLeaseAmount(Number(e.target.value))}
                      className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border" />
                  </div>
                )}
              </div>
            </div>

            {/* Forecast Period */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Forecast Period</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">Months to Forecast: {forecastMonths}</label>
                <input type="range" min="12" max="60" value={forecastMonths}
                  onChange={(e) => setForecastMonths(Number(e.target.value))}
                  className="mt-1 block w-full" />
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2 space-y-6">

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-green-600">₹{calculations.totalMonthlyRevenue.toLocaleString('en-IN')}</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600">Monthly Costs</p>
                <p className="text-2xl font-bold text-red-600">₹{calculations.totalMonthlyCosts.toLocaleString('en-IN')}</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600">Monthly Profit</p>
                <p className={`text-2xl font-bold ${calculations.monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{calculations.monthlyProfit.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600">Break-even</p>
                <p className="text-2xl font-bold text-blue-600">
                  {calculations.breakEvenMonth ? `${calculations.breakEvenMonth} mo` : 'N/A'}
                </p>
              </div>
            </div>

            {/* Initial Investment Info */}
            {includeInitialCost && calculations.initialInvestment > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700">Initial Investment Included in Break-even</p>
                <p className="text-xl font-bold text-yellow-700">₹{calculations.initialInvestment.toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {financingMode === 'cash' && 'Full cash payment'}
                  {financingMode === 'loan' && `Down payment (Truck: ₹${truckCost.toLocaleString('en-IN')} - Loan: ₹${loanAmount.toLocaleString('en-IN')})`}
                  {financingMode === 'lease' && 'One-time lease payment'}
                </p>
              </div>
            )}

            {/* Cost Breakdown */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Cost Breakdown</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Driver Salary</p>
                  <p className="text-lg font-semibold">₹{driverSalary.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Maintenance</p>
                  <p className="text-lg font-semibold">₹{maintenancePerMonth.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fuel Cost</p>
                  <p className="text-lg font-semibold">₹{Math.round(calculations.fuelCost).toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-500">{Math.round(calculations.totalMonthlyDistance)} km/month</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {financingMode === 'loan' ? 'Loan EMI' : 'Financing'}
                  </p>
                  <p className="text-lg font-semibold">
                    {financingMode === 'loan' ? `₹${Math.round(calculations.emi).toLocaleString('en-IN')}` : '₹0'}
                  </p>
                  {financingMode === 'loan' && (
                    <p className="text-xs text-gray-500">for {loanTenure} months</p>
                  )}
                </div>
              </div>
            </div>

            {/* Revenue vs Costs Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Revenue vs Costs</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={calculations.forecastData.slice(0, 12)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                  <Bar dataKey="costs" fill="#ef4444" name="Costs" />
                  <Bar dataKey="profit" fill="#3b82f6" name="Profit" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Cumulative Profit Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Cumulative Profit Over Time</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={calculations.forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                  <Legend />
                  <Line type="monotone" dataKey="cumulative" stroke="#8b5cf6" strokeWidth={3} name="Cumulative Profit" />
                </LineChart>
              </ResponsiveContainer>
              {calculations.breakEvenMonth && (
                <p className="text-sm text-gray-600 mt-2">
                  Break-even point: Month {calculations.breakEvenMonth}
                  ({Math.floor(calculations.breakEvenMonth / 12)} years {calculations.breakEvenMonth % 12} months)
                </p>
              )}
              {!calculations.breakEvenMonth && (
                <p className="text-sm text-red-600 mt-2">
                  Break-even not achieved within forecast period. Consider adjusting pricing or volume.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}