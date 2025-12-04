/**
 * Enhanced Shipping API Functions with Tier Support
 */

import { API_BASE_URL } from './api';

/**
 * Fetch all shipping methods with their pricing tiers
 */
export const getShippingMethodsWithTiers = async () => {
  try {
  const response = await fetch(`${API_BASE_URL}/api/orders/shipping-methods/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching shipping methods with tiers:', error);
    throw error;
  }
};

/**
 * Get shipping price for a specific method and quantity
 * @param {number} methodId - The shipping method ID
 * @param {number} quantity - Number of items to ship
 */
export const getShippingPriceForQuantity = async (methodId, quantity) => {
  try {
    const response = await fetch(
  `${API_BASE_URL}/api/orders/shipping-methods/${methodId}/price-for-quantity/?quantity=${quantity}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting shipping price for quantity:', error);
    throw error;
  }
};

/**
 * Calculate shipping costs for all available methods based on cart quantity
 * @param {number} cartQuantity - Total number of items in cart
 */
export const calculateAllShippingOptions = async (cartQuantity) => {
  try {
    const methods = await getShippingMethodsWithTiers();
    const shippingOptions = [];

    for (const method of methods) {
      try {
        const priceData = await getShippingPriceForQuantity(method.id, cartQuantity);
        shippingOptions.push({
          id: method.id,
          name: method.name,
          description: method.description,
          price: parseFloat(priceData.price),
          basePrice: parseFloat(priceData.base_price),
          hasTiers: priceData.has_tiers,
          quantity: cartQuantity
        });
      } catch (error) {
        console.error(`Error getting price for ${method.name}:`, error);
        // Fallback to base price if tier calculation fails
        shippingOptions.push({
          id: method.id,
          name: method.name,
          description: method.description,
          price: parseFloat(method.price),
          basePrice: parseFloat(method.price),
          hasTiers: false,
          quantity: cartQuantity
        });
      }
    }

    return shippingOptions.sort((a, b) => a.price - b.price); // Sort by price
  } catch (error) {
    console.error('Error calculating shipping options:', error);
    throw error;
  }
};

/**
 * Get the best shipping option (cheapest) for a given quantity
 * @param {number} cartQuantity - Total number of items in cart
 */
export const getBestShippingOption = async (cartQuantity) => {
  try {
    const options = await calculateAllShippingOptions(cartQuantity);
    return options.length > 0 ? options[0] : null; // First item is cheapest due to sorting
  } catch (error) {
    console.error('Error getting best shipping option:', error);
    throw error;
  }
};

/**
 * React hook for shipping calculations
 */
export const useShippingCalculator = () => {
  const [shippingOptions, setShippingOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateShipping = async (cartQuantity) => {
    setLoading(true);
    setError(null);
    
    try {
      const options = await calculateAllShippingOptions(cartQuantity);
      setShippingOptions(options);
    } catch (err) {
      setError(err.message);
      setShippingOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const getShippingPrice = (methodId) => {
    const option = shippingOptions.find(opt => opt.id === methodId);
    return option ? option.price : 0;
  };

  return {
    shippingOptions,
    loading,
    error,
    calculateShipping,
    getShippingPrice
  };
};

/**
 * Enhanced cart total calculation with tiered shipping
 */
export const calculateCartTotalWithTieredShipping = (cartItems, selectedShippingMethodId, shippingOptions = []) => {
  const subtotal = cartItems.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  const totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);

  let shippingCost = 0;
  const selectedShipping = shippingOptions.find(option => option.id === selectedShippingMethodId);
  if (selectedShipping) {
    shippingCost = selectedShipping.price;
  }

  return {
    subtotal,
    shippingCost,
    total: subtotal + shippingCost,
    totalQuantity,
    selectedShipping
  };
};

/**
 * Component example for shipping selection with tiers
 */
export const ShippingCalculatorExample = ({ cartItems, onShippingSelect }) => {
  const { shippingOptions, loading, error, calculateShipping } = useShippingCalculator();
  const [selectedMethodId, setSelectedMethodId] = useState(null);

  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      calculateShipping(totalQuantity);
    }
  }, [cartItems]);

  const handleShippingSelect = (methodId) => {
    setSelectedMethodId(methodId);
    const selectedOption = shippingOptions.find(opt => opt.id === methodId);
    if (onShippingSelect && selectedOption) {
      onShippingSelect(selectedOption);
    }
  };

  if (loading) return <div>Calculating shipping options...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="shipping-calculator">
      <h3>Shipping Options</h3>
      {shippingOptions.map(option => (
        <div 
          key={option.id} 
          className={`shipping-option ${selectedMethodId === option.id ? 'selected' : ''}`}
          onClick={() => handleShippingSelect(option.id)}
        >
          <div className="option-header">
            <span className="name">{option.name}</span>
            <span className="price">${option.price.toFixed(2)}</span>
          </div>
          {option.description && (
            <div className="description">{option.description}</div>
          )}
          {option.hasTiers && option.price !== option.basePrice && (
            <div className="tier-info">
              Quantity discount applied! (Base price: ${option.basePrice.toFixed(2)})
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default {
  getShippingMethodsWithTiers,
  getShippingPriceForQuantity,
  calculateAllShippingOptions,
  getBestShippingOption,
  useShippingCalculator,
  calculateCartTotalWithTieredShipping,
  ShippingCalculatorExample
};
