"use client";

import { getProducts } from "@/app/(common layout)/products/_action";
import { useQuery } from "@tanstack/react-query";

export default function ProductsList() {
  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });

  // console.log(data);

  // if (isLoading) {
  //   return <p>Loading...</p>;
  // }

  return (
    <div>
      {data?.data?.data?.map((product) => (
        <div key={product.id}>{product.name}</div>
      ))}
      There is no data here
    </div>
  );
}
